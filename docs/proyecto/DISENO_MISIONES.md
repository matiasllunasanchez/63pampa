# DISEÑO DE MISIONES — relevamiento, armado por misión y brechas · Campaña "El cuaderno de Mateo"

> **Qué es (19/8/2026):** el cruce entre el GUION_3 (3.7, 14 misiones) y **lo que el motor
> tiene construido HOY**, con una propuesta de armado por misión — enemigos, densidades,
> tramos, clima, clímax, poderes, mejoras — y la lista honesta de lo que falta crear.
> **Es planificación, no desarrollo**: nada de lo de acá está implementado salvo donde se
> marca ✅.
>
> **Fuentes:** `GUION_3.md` (manda en lo narrativo) · `MISION_FINAL.md` (m14) ·
> `PLAN_CAMPANA_001.md` (el remapeo 12→14, pendiente) · `COMO_PROBAR.md` (el catálogo de
> lo construido) · `src/data/missions.js` + `src/systems/spawn.js` (la verdad del código).
>
> **Numeración: SIEMPRE la canon de 14** (la del guion). El código hoy tiene 12 (`m1…m12`,
> sin EL INVENTO ni LOS PRIMOS); el id de código va entre paréntesis. El remapeo es la
> brecha nº 1 (§8).
>
> **Marcas:** ✅ existe y sirve tal cual · 🟡 existe, pide ajuste/dato · 🔴 hay que crearlo.
>
> **El plan de EJECUCIÓN de este diseño** (fases por misión, el selector de pruebas, el
> tablero de orden) vive en [PLAN_MISIONES_FASES.md](PLAN_MISIONES_FASES.md); la mecánica
> de tramos tiene su spec en [SPEC_TRAMOS.md](../sistemas/SPEC_TRAMOS.md).

---

## 1. El inventario — las piezas que el armado tiene disponibles HOY

### Sistemas ✅ (verificados en código / COMO_PROBAR)

| pieza | estado | nota para el armado |
|---|---|---|
| PASILLO completo (gas, ras, multiplicador, racha, radar, turbo) | ✅ | turbo YA quema nafta extra (3.2+4.2/s) — el pedido "el turbo gasta" está hecho |
| Terrenos: **mar / tierra (con relieve) / costa (desembarco)** | ✅ | la COSTA trae carpas, AA, edificios armados, barcazas LCU, radar móvil, camión AA, trincheras propias, rompiente |
| Enemigos: mástil-fragata, globo, helo, **jet (teje, te busca, 45% dispara)**, aves, bombas del cielo, soldados | ✅ | movimiento propio configurable |
| **LA COLA** (Harrier: presión→sobrepaso→ventana; `cfg.caza` 0/1/2) | ✅ | el aire-aire del juego; gate: aparece tras cruzar jets |
| **PERSECUCIÓN** (volar de numeral tras un líder visible que esquiva) | ✅ | `cfg.persec` — m1 ya lo usa: el tutorial ES seguir a Puma |
| **LAS OLAS** (marejada/rompiente/rebelde en tormenta) | ✅ | la rebelde avisa por radio SOLO si hay escuadrón vivo |
| Clima: viento, lluvia (2 niveles), niebla (banco corto/largo), cielos (dawn…night), mar por clima | ✅ | |
| Clímax: **PASADA** (bandas+ristra+sapito, rescate R0–R2 cerrado, R3+ en curso) · **ARENA** · **EL PULSO** (entero, sin misión asignada) · momentum viejo (fallback `?no3d`) | ✅ | el clímax es DATO (`climax:` por misión) |
| Poderes: **MOMENTUM** (tecla 4) · **LA CHANCHA** (tecla 5, construida) | ✅ | ver §6: la ventana narrativa hay que INVERTIRLA |
| Escuadrón = vidas + relevo cinemático · **AVERÍAS** (3 modelos de vida) | ✅ | roster por misión ya en `missions.js` |
| Banco del Pichón (12 mejoras=piruetas, ofertas de a 2, save `ups`) | ✅ | hoy ofrece tras CADA misión en orden causal — ver §5 |
| Historia VN (motor de líneas F1 + `?scene=`), guion v0.0.2 entero en pantallas | ✅ | F2+ en curso — ver SPEC_MODO_HISTORIA |
| Cordón final (VEIL: no spawnea nadie cerca del buque) | ✅ | el "respiro antes del boss" ya es automático |
| DESTRUCCIÓN (despiece, cadenas, choque mutuo) | ✅ | |

### Lo que el armado NECESITA y no existe *(resumen; detalle y prioridad en §8)*

| brecha | para qué misiones |
|---|---|
| 🔴 **Remapeo 12→14** (insertar EL INVENTO y LOS PRIMOS) | M3, M10 y toda la numeración |
| 🔴 **TRAMOS por misión** (§2 — la propuesta central de este doc) | M1, M4, M9, M14… todas ganan forma |
| 🟡 Marcas de Cóndor en HUD + pérdida de señal (el Narwal) | M4 (las tiene) → M5 (no) · M10 (van y vienen) |
| 🔴 Escena de historia POR EVENTO en pleno vuelo (hook F4 del modo historia) | M10 (Tandil) · M12 (el corte a tierra) |
| 🔴 Estado `ending` + los dos finales (F5 historia) | M14 |
| 🟡 Numeral VISIBLE de escolta (reusar `persec.js` del otro lado) | M7 (el Vasco ala con ala) · M10 (el hueco que nadie ocupa) |
| 🔴 Props de tutorial: tambores/boyas flotantes destructibles | M1, M3 |
| 🟡 Presupuesto de nafta POR MISIÓN (tanque/drain como dato) | M10, M13, M14 — §7 |
| 🔴 M14 real (contrarreloj, muertes scripted, vorágine, planeo) | M14 — proyecto propio (MISION_FINAL.md) |
| 🔴 Voces británicas de pánico (audio real) | M4/M5 — cuando haya samples |
| 🔴 Asistencia progresiva (principio §0 del guion) | transversal |

## 2. LA PROPUESTA CENTRAL: los TRAMOS *(la única mecánica nueva que este plan pide)*

Hoy el spawn es **una sola densidad pareja** por misión (`cfg.obstacles` + mezcla por
terreno). Alcanza para POR LA PATRIA, pero el guion pide misiones **con forma**: el
tránsito mudo del Narwal (M4), el cordón de radares del final (M2), el infierno que crece
(M9), las fases de M14. Todo eso es LA MISMA herramienta:

```
tramos: [                            // fracciones de la distancia objetivo, en orden
  { hasta: 0.35, obstacles: 0.3, caza: 0, radio: 'm4_narwal' },   // tránsito: solo la radio
  { hasta: 0.85, obstacles: 1.2, caza: 1 },                        // mar abierto
  { hasta: 1.0,  obstacles: 1.8, densidadDe: ['aa','radar'] },     // el cordón final
]
```

- `spawnSystem` ya recibe `objectiveDist`: leer el tramo vigente es una búsqueda por
  fracción. Sin tramos, la misión rige por `cfg` como hoy — **cero cambio en lo existente**.
- `radio:` dispara UNA clave de strings al entrar al tramo (la costura para el Narwal, los
  avisos de la base, el Turco de M14). Es un popup/radio, no una escena.
- Costo estimado: chico (es data + una búsqueda). **Es la mejor relación costo/valor de
  todo este documento**: convierte 14 configs planas en 14 niveles con dramaturgia.

> ✅ **CONSTRUIDO (19/8/2026).** El spec ejecutable quedó en
> [SPEC_TRAMOS.md](../sistemas/SPEC_TRAMOS.md) y está implementado entero (T0–T4), con
> `npm run tramos` como fixture y **M4 (m3) como misión piloto: su tránsito se vuela con cero
> spawns y la conversación del Narwal suena en orden**. Dos cosas cambiaron respecto del boceto
> de arriba: la clave del sesgo de mezcla se llama **`favor`** (no `densidadDe`) y funciona por
> re-sorteo, y el tránsito va con **`obstacles: 0`**, no 0.3 — el guion pide "sin un solo
> enemigo en pantalla" y con 0.3 igual nace algo cada doscientos metros.

## 3. La tabla maestra *(la campaña de un vistazo — valores PROPUESTOS)*

| M | (código) | goal | clímax | terreno | cielo/clima | obst | bombs | caza | persec | squad | chancha | nafta | enseña |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | m1 | dist 2200 | — | mar | dawn, calmo | 0.5 | 0 | 0 | **1** ✅ | 5 | — | off | el ras y el mult |
| 2 | m2 | dist 2600 | — | **costa** | dusk, viento | 1.0 | 0.5 | 1 | 0 | 5 | — | off | el fuego enemigo y LA COLA |
| 3 | 🔴 | dist 2400 | — | costa suave | sun, calmo | 0.7 | 0 | 0 | 0 | 5 | — | off | las MEJORAS (la 1ª ya puesta) |
| 4 | m3 | SHEFFIELD | PASADA | mar | dusk, viento | 1.0 | 0.5 | 1 | 0 | 5 | — | on | la PASADA y las bandas |
| 5 | m4 | ARDENT | **ARENA** ✅ | **costa densa** | cloudy | 1.7 | 1 | 1 | 0 | 5 | — | on | el callejón; volar sin datos |
| 6 | m5 | ANTELOPE | PASADA | mar | sun, fog corto | 1.7 | 1 | 1 | 0 | 5 | — | on | la banda DORMIDA (el título) |
| 7 | m6 | COVENTRY | PASADA | mar | clear | 1.7 | 1 | **2** | 🟡 Vasco | 5 | **SÍ** | on | la salida también mata |
| 8 | m7 | CONVEYOR | PASADA | mar | dusk, rain 1 | 1.7 | 1 | 1 | 0 | 4 | SÍ | on | (el sobrevuelo — narrativo) |
| 9 | m8 | dist 3200 | 🟡 depósito | **costa** | **storm, rain 2** | 1.7→2 | 2 | 2 | 0 | 4 | SÍ | on | el infierno lleno |
| 10 | 🔴 | dist 3600 | — | mar | dusk→storm, fog LARGO | 0.5 | 0 | 0 | 0 | 3 | **NO (cobro)** | **justa** | el infierno vacío: la nafta |
| 11 | m9 | GALAHAD | PASADA | mar | cloudy | 1.7 | 1 | 2 | 0 | 3 | NO | on | (el respiro: nada nuevo) |
| 12 | m10 | TRISTRAM | PASADA | mar | dusk, rain 1 | 1.7 | 2 | 1 | 0 | 3 | NO | on | (el corte a tierra) |
| 13 | m11 | BROADSWORD | PASADA | **tierra** | **moon**, fog | 1.7 | 2 | 2 | 0 | 3 | NO | justa | la noche; el sapito real |
| 14 | m12 | GLAMORGAN | **PULSO** (el misil) | mar | **night**, fog largo | tramos | 2 | 2 | 0 | 3 | NO | justa | todo lo aprendido |

> ⚠ **Interino (19/8, decisión del autor):** hasta que ARENA y PASADA se pulan en sus
> modos propios (MINUTOS SAGRADOS / PASADAS MORTALES), la campaña cierra TODOS los buques
> con `climax: 'pulso'` + su cinemática compuesta (PLAN_MISIONES_FASES §1b). La columna
> clímax de esta tabla es el objetivo a largo plazo, no el estado interino.

Notas de la tabla: `persec` en M1 ya está en el código ✅ · `caza 2` = los Harriers pesados
(M7 la salida, M9, M13) · la columna nafta usa §7 · el clímax de M5 y el default PASADA ya
están como dato en `missions.js` ✅ · M14 cambia `arena` → `pulso` cuando exista la misión
real (EL PULSO es su vía de entrada garantizada — PLAN_EL_PULSO §Q4).

## 4. Misión por misión

### M1 — SAL EN LAS ALAS *(m1 · tutorial puro: cero fuego enemigo)* — armable HOY al 90%
- **Guion:** conocer a la familia; esquivar mástiles de flotilla pesquera, seguir a Puma
  entre las olas, tirar a tambores flotantes. "Los huevos se enseñan como mecánica."
- **Armado (tramos):** 0–30% mástiles y aves solamente, PERSECUCIÓN activa ✅ (seguir a
  Puma ES el tutorial del ras) · 30–70% + globos SIN armas + 🔴 **tambores flotantes**
  (destructible inofensivo, +150, el blanco de cañón que hoy no existe) · 70–100% Puma se
  adelanta y el tramo final es tuyo, densidad plena de mástiles.
- **Sin**: bombs, jets, AA, olas (sin viento no salen ✅), nafta, clímax.
- **Falta:** 🔴 tambores (chico) · el "puente de chapa" del guion: opcional, o un arco de
  dos mástiles juntos (🟡 gratis).

### M2 — BAUTISMO DE FUEGO *(m2 · la primera de verdad)* — armable HOY
- **Guion:** costa, 1 de mayo; el jugador SIENTE la brecha (Harriers, misiles).
- **Armado:** terreno **COSTA** ✅ (hoy está en mar — el desembarco británico ya existe y
  es ESTA misión): AA, carpas, radar móvil. `caza: 1` — acá se presenta **LA COLA** ✅.
  Tramos: 0–40% suave (mástiles + estructura suelta) · 40–100% el desembarco de verdad.
- **El "boss radar" del canon:** propuesta A (recomendada): sin boss — el **cordón final**
  es un tramo denso de radares móviles + AA para reventar antes del velo (con TRAMOS, es
  data). Propuesta B (futura): estación de radar con HP como boss terrestre (ROADMAP #19).
- **Falta:** nada bloqueante. 🟡 mover terrain a `coast`.

### M3 — EL INVENTO 🔴 *(no existe en código — remapeo)* — armable apenas se inserte
- **Guion:** patrulla cómica; se enseña la mecánica de mejoras; cierra con el Belgrano.
- **Armado:** costa suave, obst 0.7, cero caza/bombs. Blancos de oportunidad: los tambores
  de M1 como boyas + un radar móvil suelto ✅. **La 1ª mejora se eligió tras M2** (ver §5)
  y esta misión es para SENTIRLA en las manos.
- **Falta:** solo el remapeo + su `story`/`epi` (el guion ya está escrito; pantallas =
  motor F1 ✅). La noticia del Belgrano es una pantalla más del epílogo.

### M4 — EL DÍA QUE SANGRÓ EL MAR *(m3 · Sheffield — la primera PASADA)*
- **Guion:** el tránsito del Narwal (2–3 min SOLO radio, las posiciones marcadas en HUD) →
  la misión → primera gran victoria.
- **Armado (tramos):** ✅ **hecho** — 0–35% **tránsito** en CUATRO tramos (una radio suena una
  vez por tramo, así que la conversación se reparte en cuatro entradas), con `obstacles: 0`,
  `bombs: 0`, `caza: 0` y `marcas: true`; 35–100% mar abierto (1.2, caza 1). Medido: cero
  spawns en el tránsito, las cuatro líneas en orden, y el mar abierto llegando con densidad
  plena. Lo que sigue pendiente son las marcas en el HUD (ítem H). Boceto original: 0–35%
  **tránsito**: obst 0.3, sin enemigos, la conversación del
  Narwal por radio (`radio:` del tramo) y 🟡 **las marcas de Cóndor en el HUD** (puntitos
  en la barra de misión: los blancos que la radio dicta — chico, y el cobro de M5 lo paga
  doble) · 35–100% mar abierto pleno, caza 1 · clímax **PASADA** (la primera: acá se
  aprenden las bandas — el rescate R1/R2 ya la hizo legible ✅).
- **Falta:** ~~TRAMOS~~ ✅ · marcas HUD 🟡 · voces británicas de pánico 🔴 (audio, no bloquea).

### M5 — EL CALLEJÓN DE LAS BOMBAS *(m4 · Ardent · clímax ARENA ✅ ya decidido y cableado)*
- **Guion:** San Carlos, la boca del lobo; el silencio del Narwal (entrar con MENOS datos).
- **Armado:** COSTA DENSA ✅ (obst 1.7 — el desembarco entero: LCU entrando, AA, carpas
  pariendo soldados, edificios que tiran) · **sin marcas de Cóndor en HUD** (el dato que
  M4 te dio y ahora no está: es data del tramo, y el jugador lo siente sin cartel) ·
  clímax ARENA ✅ (el callejón ES una arena — ya en `missions.js`).
- **La escucha** ("no mires al cielo") = pantalla del epílogo ✅ (ya en strings).
- **Falta:** nada bloqueante una vez que existan las marcas de M4 (la ausencia es gratis).

### M6 — LA BOMBA QUE NO DESPERTÓ *(m5 · Antelope — la ventana de armado ES el título)*
- **Guion:** hacés todo bien y el sistema te lo niega. Epílogo: aparece LA CHANCHA
  (salva al Gitano y se rompe).
- **Armado:** mar, sol + fog corto ✅ · clímax **PASADA con la banda DORMIDA como
  protagonista**: 🟡 la primera suelta dormida de la campaña muestra el popup pedagógico
  ("NO DESPERTÓ" ya existe ✅) + una línea de radio de Puma (la del briefing: "para que
  arme, tenés que soltarla más alto"). La mecánica ya está construida; acá se ENSEÑA.
- **Epílogo** = pantallas ✅ + **desbloquea el poder LA CHANCHA para M7** (ver §6).

### M7 — 25 DE MAYO *(m6 · Coventry — muere el Vasco EN LA SALIDA)*
- **Guion:** fiesta patria; el Vasco ala con ala TODA la misión; a la salida un Sea
  Harrier lo engancha; el jugador al lado, sin poder hacer nada.
- **Armado:** mar claro, obst 1.7, **caza 2** (la salida es de ellos) · clímax PASADA ·
  **CHANCHA disponible por primera vez** (§6).
- **El Vasco visible:** 🟡 reusar la tecnología de PERSECUCIÓN (el líder visible que
  esquiva ✅) como **numeral pegado al ala** — vuela tu carril con offset, esquiva solo,
  no choca. Su muerte: v1 (HOY) en las pantallas del epílogo ✅ como está escrito; v2: el
  evento scripted en el tramo de salida (el Harrier que lo saca EN pantalla) — 🔴 medio,
  y vale oro: es la primera muerte.
- **Falta:** v1 nada; v2 el numeral + el evento.

### M8 — EL BATIR DE ALAS *(m7 · Conveyor — el sobrevuelo)*
- **Guion:** la misión por el Vasco; y los treinta segundos: bajar sobre el monte, batir
  las alas, la multitud de casquitos.
- **Armado:** mar, dusk, rain 1, squad 4 ✅ · clímax PASADA · v1 (HOY): el sobrevuelo en
  pantallas ✅ (ya escrito, con sus cuadros sagrados para cuando haya arte).
- **v2 — el sobrevuelo JUGABLE** 🔴 (recomendado a futuro, no bloquea): tramo post-clímax
  sobre TIERRA (el terreno ya existe), pozos y casquitos abajo (soldados decor ✅), y el
  batir = doble toque de rolar a baja altura sobre el monte → la escena responde
  (gritos, cascos al aire). Es EL momento del juego; merece manos en los controles.

### M9 — EL PIBE *(m8 · muere el Pichón — el infierno lleno)*
- **Guion:** el centro logístico de San Carlos; lo más denso de la guerra; el misil que
  venía para vos.
- **Armado:** terreno **COSTA** 🟡 (hoy mar — y la costa ES el desembarco/centro
  logístico) · **storm + rain 2 + bombs 2** ✅ (la tormenta habilita la ola REBELDE ✅) ·
  tramos: densidad que CRECE 1.7 → 2.2 hacia el final.
- **El "boss centro logístico":** propuesta A (hoy): distancia + cordón final de depósitos
  y AA bien denso (las CADENAS de destrucción ✅ lucen acá: un depósito entre carpas).
  Propuesta B (chica, recomendada): un **DEPÓSITO MAYOR** al final — el prop `depot`
  escalado con HP alto y 2 AA custodias; volarlo cierra la misión. Sin sistema nuevo:
  es un obstáculo gordo + `'objective'`.
- **La muerte del Pichón:** v1 pantallas ✅ (escrita); v2 scripted en la salida 🔴.

### M10 — LOS PRIMOS 🔴 *(no existe en código — la más larga y ciega)* — el nivel es el clima
- **Guion:** reconocimiento armado con el tiempo cerrado; sin boss y sin blancos; la señal
  de Cóndor va y viene; **la nafta es el reloj**; intercalado Tandil; desbloqueo Mirage.
- **Armado:** mar, dusk→storm, **fog LARGO** ✅, viento, olas ✅, obst 0.5 (mástiles y
  aves — vacío a propósito), caza 0, bombs 0, squad 3 · distancia LA MÁS LARGA (3600) ·
  **nafta JUSTA** (§7): tanque corto, sin bidones en el último tercio (tramos) · la señal
  de Cóndor 🟡: las marcas del HUD aparecen y desaparecen por tramo + estática.
- **La CHANCHA: la negativa** — el jugador la tuvo 3 misiones; acá la pide y la radio
  contesta la línea de Puma: *"La Chancha no baja más al sur."* El poder se cobra como
  trama (§6). ✅ mecánicamente (gate por misión ya existe), 🟡 la línea nueva.
- **Intercalado Tandil:** 🔴 escena por evento a mitad de vuelo (hook F4 del modo
  historia — mismo mecanismo que necesita M12; se construye UNA vez). El desbloqueo
  MIRAGE 🔴 (placa SISTEMA + avión en CICLO/ARENA/MINUTOS SAGRADOS — PLAN_CAMPANA_001 §7).
- **Falta:** remapeo + F4 + señal por tramos + nafta por misión. Es la misión nueva más
  cara — y la única del juego que se gana VOLVIENDO.

### M11 — LO QUE NO SE DICE *(m9 · Galahad — el respiro tenso)* — armable HOY
- **Guion:** el jugador espera el golpe y el golpe no llega. Vuelven los tres.
- **Armado:** exactamente lo que el código ya tiene (cloudy, 1.7, caza 2, squad 3, PASADA).
  **Cero eventos, cero sorpresas: el diseño es que no pase nada** — la tensión la trae el
  jugador. La misión más barata del juego, a propósito.

### M12 — EL ÁNGEL CORRENTINO *(m10 · Tristram — muere Correa)*
- **Guion:** a mitad del vuelo el juego corta a tierra: Correa cubre a Mateo con el cuerpo.
- **Armado:** mar, dusk, bombs 2, rain 1 ✅ · clímax PASADA ✅ (decisión del autor ya en
  `missions.js`) · **EL CORTE A TIERRA** 🔴: escena por evento al 50% del vuelo (hook F4 —
  el mismo de Tandil). v1 (HOY): la escena va en el epílogo ✅ (ya escrita); pero esta es
  LA misión que justifica construir F4 — el guion dice "hay cosas que no pueden esperar
  al final del nivel".

### M13 — LA ÚLTIMA MESA *(m11 · Broadsword — la noche, el asado, LA CARTA)*
- **Guion:** apoyo a los montes; abajo pozos y casquitos PROPIOS; "hoy la nafta se cuida".
- **Armado:** **TIERRA + luna** ✅ (ya en código), fog 1, bombs 2, caza 2 · abajo,
  soldados como DECOR amigo 🟡 (no puntúan, no se pisan — variante chica del sistema de
  soldados: bando `ar`) · **nafta justa** (§7) · clímax **PASADA contra el Broadsword** —
  **el buque del sapito real** (el rebote documentado del 25/5): si el jugador saca el
  sapito acá, popup especial 🟡 (una línea: el juego guiña la historia sin cartel).
- **El asado + LA CARTA:** pantallas ✅ (escritas; los cuadros llegan con el arte).

### M14 — EL TERO *(m12 · Glamorgan — el proyecto grande; diseño en MISION_FINAL.md)*
- **Guion:** contrarreloj; muere el Gitano (señuelo), muere Puma (la puerta); el vacío; el
  momento del misil; LA DECISIÓN sin menú; dos finales.
- **Hoy en código:** misión normal night+fog con clímax `arena` — v0 funcional.
- **Plan por versiones** (cada una shippeable):
  - **v1 (HOY):** todo narrado en pantallas ✅ (v0.0.2 tal como está).
  - **v2 (el salto grande de valor):** `climax: 'pulso'` — **EL PULSO ya está construido y
    ESTA misión es su vía de entrada garantizada** (PLAN_EL_PULSO §Q4): el momento del
    misil como examen de pulso con las piruetas aprendidas. + estado `ending` (F5
    historia): la decisión con dos entradas y las cadenas A/B en pantallas.
  - **v3 (la misión real):** TRAMOS scripted — fase reloj (radio del Turco: "¡ADELANTARON
    EL BOMBARDEO!") → fase pantalla (muerte del Gitano en acción) → fase capitán (la IA de
    Puma — lo más caro del juego) → el vacío (obst 0) → EL PULSO → decisión → **Final A**
    vorágine jugable (oleada infinita + munición libre — tramos + un knob) / **Final B**
    planeo del sapito (nafta 0 + planeo con toques al agua 🔴).
- **Regla del guion que manda acá:** morir y reintentar ES diseño (única misión sin
  asistencia plena). El contrarreloj y las muertes van en gameplay, nunca en cutscene
  que congele.

## 5. Las mejoras del Pichón — el flujo propuesto

**Hoy en código (actualizado 23/8 — LA RAMPA DE ENTRADA, pedido de Matías):** el ritmo lo
dice `ofertaTrasMision(i)` en `data/upgrades.js`, una sola fuente que el selector de misiones
**deriva** en vez de repetir:

| epílogo de | ofrece | por qué |
|---|---|---|
| **M1** (tutorial) | **nada** — el banco ni se abre | que el tutorial no premie es parte de lo que dice: todavía no pasó nada que resolver |
| **M2** | **UNA, servida** (sin elegir) | se aprende QUÉ es el banco sin tener que decidir. La pantalla es la misma con una sola carta; el subtítulo pasa a "TU PRIMERA MEJORA" y el pie deja de ofrecer las flechas |
| **M3 en adelante** | **DOS, a elegir** | recién acá empieza el roguelike, y con una pirueta ya en la mano contra la cual comparar |

**Lo que esto arregla:** antes el banco se abría tras CADA epílogo y siempre con dos cartas, o
sea que **la primera decisión del juego caía justo después del tutorial** — elegir entre dos
piruetas cuando el jugador todavía no sabe qué es una pirueta ni para qué sirve ninguna de las
dos. Elegir sin entender no es elegir: es apretar.

Esto es casi la propuesta de la tabla de abajo (1ª ventana tras M2) con una diferencia: la
propuesta ofrecía **dos fijas** en esa primera ventana y el código sirve **una**. Sigue
pendiente lo que el guion 3.0 pide además: que las ofertas sean **al azar** del pool no
aprendido, con gate de tramo. TONEL clásico de fábrica; save `ups` ✅.

**Propuesta (con el remapeo a 14):**

| ventana | tras | qué se ofrece |
|---|---|---|
| 1ª | M2 | las dos primeras del orden causal, fijas (MASK / SPLIT-S) — la 1ª mejora se estrena EN M3, que es su misión-escuela |
| 2ª–7ª | M3–M8 | **dos AL AZAR** del pool no aprendido, EXCLUIDAS las tres póstumas — el roguelike del guion |
| 8ª–11ª | M9–M13 | dos al azar del pool completo: **desde M9 (la libreta) entran ASCENSO, SOBRE EL RADAR y TONEL BARRIL** — las que el Turco construye de noche. La pantalla ya cambia de nombre (BANCO → LIBRETA ✅) |
| — | M13→M14 | **sin oferta** ("lo que llevás al final es todo lo que un pibe de 22 alcanzó a imaginar") |

⚠️ **LA CUENTA CAMBIÓ CON LA RAMPA.** Con 12 misiones eran 11 ventanas para 12 mejoras y
**una** quedaba sin aprender — la cuenta que pide el guion (§5 de GUION_3). La rampa le saca
la ventana al tutorial, así que quedan **10 ventanas y DOS mejoras sin aprender**. Es
consecuencia directa del pedido, no un descuido, y hay un unit test que se entera si vuelve a
moverse. Tres salidas si se quiere volver a una: sacar una mejora del catálogo, sumar una
ventana en otro lado, o aceptar la nueva cuenta y **corregir la frase del guion** — es una
decisión de autor, no de código. Con el remapeo a 14 misiones la cuenta se recalcula sola.

El TONEL BARRIL de M14 no depende de tenerlo: la cinemática del final lo vuela igual (es de
guion, no de inventario).
Costo: 🟡 chico — `nextUpgrades` pasa de "primeras 2" a "2 sorteadas con gate de tramo".

## 6. LA CHANCHA — invertir la ventana *(decisión de Matías, 18/8, pendiente de aplicar)*

**Hoy el código la da vuelta:** disponible M1–M6 y rota desde M7 (`chancha: false`). La
decisión nueva del autor — "se habilita POST misión de aparición, por un par de misiones
más" — calza MEJOR con el guion: la Chancha se presenta narrativamente en el epílogo de
M6 (salva al Gitano, queda rota **pero "vuela corto: sirve para trabajos cerca"**), y
recién en M10 Puma dice "no baja más al sur".

| tramo | poder | por qué |
|---|---|---|
| M1–M6 | **NO** (ni barra) | el jugador todavía no la conoce; las misiones son cortas |
| **M7–M9** | **SÍ** | la acabás de ver salvar al Gitano; "vuela corto" = viene si la llamás. El jugador aprende a quererla |
| M10+ | **NO — con la negativa** (`ch_broken`: "la Chancha no baja más al sur") | el cobro: perdés algo que usaste, justo cuando la nafta se vuelve el reloj |

Cambio: data de `missions.js` + estrenar la línea de radio. Anotar en
`SPEC_PODER_CHANCHA.md` §9 al implementarlo. Costo 🟡 chico.

## 7. El combustible como arco *(el pedido "que el turbo gaste" YA está: 3.2+4.2/s)*

Lo que falta es que la nafta CUENTE distinto según la misión — hoy es on/off global.
Propuesta: `nafta:` por misión como dato — `'off'` (M1–M3: se aprende sin reloj) ·
`'normal'` (M4–M9: tanque 100, bidones normales) · `'justa'` (M10, M13, M14: tanque ~75,
bidones raros o cortados por tramo — y en M10, ninguno en el último tercio). En campaña
esta perilla PISA la de OPCIONES (la historia manda su tensión); en los demás modos rige
OPCIONES como siempre. Costo 🟡 chico. La CHANCHA (§6) y esta tabla se diseñaron juntas:
el poder existe exactamente en las misiones donde la nafta es 'normal' — en las 'justas'
ya no está, y ESO es la trama.

## 8. El veredicto — qué se arma YA y qué hay que crear

**Armables HOY, con data + tuning (sin crear nada):** M1 (90%), M2, M5, M6, M7 v1, M8 v1,
M9-A, M11, M12 v1, M13 — **diez de catorce en versión v1.** El guion de pantallas de TODAS
ya existe y corre por el motor F1 ✅.

**Orden de trabajo sugerido** *(cada ítem es chico salvo marca)*:

1. 🔴 **El remapeo 12→14** (PLAN_CAMPANA_001) — prerequisito de la numeración, M3 y M10. Medio.
2. 🔴 **TRAMOS** (§2) — la herramienta que le da forma a todo. Chico.
3. 🟡 **Chancha invertida** (§6) + **nafta por misión** (§7). Chico.
4. 🟡 **Marcas de Cóndor en HUD** + señal por tramos (M4/M5/M10). Chico.
5. 🟡 **Mejoras: azar + póstumas** (§5). Chico.
6. 🔴 **Tambores/boyas** (M1/M3). Chico.
7. 🟡 **Depósito mayor de M9** (boss liviano). Chico.
8. 🔴 **Escena por evento (F4 historia)** — Tandil (M10) y el corte a tierra (M12).
   Medio; se construye una vez, sirve dos.
9. 🟡 **El numeral visible** (Vasco M7; el hueco de M10). Medio.
10. 🔴 **Estado `ending` + finales** (F5) — habilita M14 v2 junto con `climax:'pulso'`. Medio.
11. 🔴 **M14 v3** — el proyecto grande (MISION_FINAL.md): IA de Puma, vorágine, planeo. Grande.
12. 🔴 Sobrevuelo jugable (M8 v2) · voces británicas · asistencia progresiva — valen
    mucho y no bloquean nada.

**Regla de todo el plan:** cada misión tiene su **v1 armable ya** — la campaña completa
puede jugarse de punta a punta ANTES de que exista ninguna de las piezas 🔴; cada pieza
nueva mejora una misión sin bloquear a las demás. Es el mismo principio del guion §0: la
historia primero, y la historia ya está entera en pantallas.

## 9. Divergencias y decisiones abiertas

- **M2/M9 boss terrestre:** este doc recomienda NO construir bosses de terreno todavía
  (cordón denso / depósito mayor los reemplazan). Si algún día existen, ROADMAP #19.
- **La ventana de la Chancha** (§6) contradice el código actual Y la letra original del
  SPEC_PODER_CHANCHA §2 — la decisión del autor manda; anotar allá al implementar.
- **El orden de mejoras** (§5) contradice el `nextUpgrades` actual (causal puro) — el
  guion 3.0 pide azar; la 1ª ventana fija es el compromiso que conserva la escena de M3.
- **PASADA vs rescate:** la tabla asume que el rescate (R3–R6) termina verde. Si R6
  ejecuta el ultimátum, todos los `PASADA` de la tabla pasan a `PULSO` con una palabra
  por misión — el clímax es dato, y este plan no se rompe.
