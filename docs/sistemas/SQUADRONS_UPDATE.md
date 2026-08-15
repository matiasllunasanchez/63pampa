# SQUADRONS_UPDATE — qué traer de *Star Wars: Squadrons* a MINUTOS SAGRADOS

> **Qué es este doc (14/8):** relevamiento pedido por el autor — "hacer el arena entretenido,
> trayendo lo mejor de Squadrons". NO reemplaza a `PLAN_MINUTOS_SAGRADOS.md`: es una **capa
> encima**. Aquel plan diagnosticó con números por qué el arena aburre (§2) y definió las etapas
> E0–E9; E0–E2 ya están hechas (el avión VUELA: ángulos comandados, banquear es virar, la
> gravedad cobra). Este doc dice qué mecánicas de Squadrons valen la pena, **a qué etapa E se
> enchufa cada una**, y cuáles son piezas nuevas (S1–S8).

---

## 1. Por qué Squadrons es el referente correcto — y en qué NO lo es

**Lo es** porque su mejor modo (Fleet Battles) es EXACTAMENTE la fantasía de MINUTOS SAGRADOS:
cazas chicos y frágiles contra un buque capital que se defiende, atacado por **subsistemas**,
con pasadas de ataque, presión antiaérea y la sensación de estar siempre a un error de morir.
Squadrons demostró que esa fantasía se sostiene con CUATRO pilares: gestión de energía,
maniobras de reposicionamiento (drift), subsistemas con efecto real, y una cabina que te mete
adentro. Los cuatro son importables.

**No lo es** en tres cosas, y conviene decirlas antes de copiar nada:

| Squadrons | RASANTE | Por qué no se copia |
|---|---|---|
| Vuelo espacial 6DOF, sin gravedad ni piso | El mar MATA (`SEA_KILL`) y la gravedad sangra velocidad (`G_E: 40`) | La regla del rasante ES el juego. Un arena sin piso letal es otro juego. |
| Escudos recargables | Un flak te mata | La letalidad de un impacto es la tensión del modo. Escudos la diluyen. |
| Balance multijugador | Solo single-player | Ninguna decisión se toma por equidad competitiva. |

---

## 2. El relevamiento, mecánica por mecánica

Formato: qué hace en Squadrons → qué problema MEDIDO de acá resuelve → cómo se implementa →
dónde se enchufa → estimación.

### S1 · Gestión de energía (los "pips") ⭐⭐⭐ — la firma de Squadrons ✔ (hecho 15/8/2026)

> **Medido en batalla real** (sonda `arena_s1.js`, `__adbg.pip`):
>
> | | EQUILIBRADO | MOTOR | ARMAS |
> |---|---|---|---|
> | punta con turbo | 161 m/s | **180** | 111 *(sin turbo)* |
> | calor tras 1,5 s de ráfaga | — | **0,59** | **0,09** |
> | enganchar un pintado | 0,37 s | — | **0,24 s** |
>
> **Dos posiciones y un neutro**, no las tres de Squadrons: sin escudos el tercer pip no existe.
> Y **MOTOR no "recarga el turbo más rápido"** como allá, porque el arena no tiene medidor de
> turbo: compra **punta y aceleración**, y lo paga en calor de cañón. ARMAS es su espejo — enfría
> 1,6× y pinta 0,6×, a cambio de quedarse **sin turbo** (×1.0). El intercambio queda donde el
> doc lo quería: ARMAS durante la pasada, MOTOR para volver.
>
> **Controles: `[G]` y CRUCETA ARRIBA.** `[R]` se la había llevado la media vuelta (E3). Y la
> cruceta **sí** estaba libre: §6 la daba por ocupada, pero eso vale para 14/15 (izq/der) — las
> 12/13 no las lee nadie en juego. Se cierra **D-S1** para los pips; la bengala (S5) sigue abierta.
>
> **Dónde vive:** el reparto es de MÓDULO, no de `A` — es una decisión del PILOTO y sobrevive al
> relevo del escuadrón igual que las zonas dañadas; vuelve a EQUILIBRADO al empezar batalla nueva.
> Los multiplicadores entran a `core/aero.js` **por `io`** (`turboMul`/`accMul`) y no mutando
> `AR`: los datos son datos, y el feeltest tiene que poder correr el mismo modelo sin que nadie le
> haya cambiado una constante por debajo.
>
> **Indicador:** tres casillas + el nombre en el tablero, entre la velocidad y los misiles. Cuál
> está puesto se lee **por posición y color**, sin leer la palabra. S6 (cabina viva) sigue
> pendiente: cuando llegue, esto se muda al tablero y deja de flotar.
>
> **La sonda ya lo cuenta:** `__ahist.pipSwaps`. Si en una partida jugada de verdad queda cerca de
> cero, el sistema no se usa y **se saca** — que es lo que pide §7 de este mismo documento.

**En Squadrons:** desviás potencia entre motores / láseres / escudos en todo momento. Es EL
loop de destreza: la mano nunca descansa, y cada situación tiene un reparto correcto.

**Problema que resuelve acá:** el diagnóstico §2.6 del plan ("toda la destreza del juego queda
en la puerta") — entre pasada y pasada el arena no te pide NADA. Los pips llenan exactamente
ese hueco: el tiempo de reposicionamiento se vuelve tiempo de decisión.

**Implementación RASANTE (versión 2 posiciones + neutro, no la de 3 de Squadrons —
sin escudos el tercer pip no existe):**

- Una tecla cicla `MOTOR ↔ EQUILIBRADO ↔ ARMAS` (propuesta: [TAB] / cruceta arriba; decisión
  de controles abierta, §6).
- `MOTOR`: turbo recarga más rápido y `SPD_TURBO` sube un escalón (1.5 → 1.65); el cañón
  calienta más rápido (E5 importa `GUN_HEAT` del pasillo — este ítem DEPENDE de eso).
- `ARMAS`: el cañón enfría más rápido y el pintado de misil (E5) marca más rápido; el turbo
  no recarga.
- `EQUILIBRADO`: todo neutro. El default y lo que usás si no querés saber nada.
- Estado en `systems/arena.js` (single-writer, como todo A.*); perillas en `data/arena.js`
  (`AR.PIP_*`); indicador en el HUD de cabina (S6) y mínimo en 3ª.
- **Nota honesta:** un A-4 no gestiona energía así — es una abstracción arcade de la ATENCIÓN
  del piloto. La prioridad es el juego, no lo histórico (regla del proyecto).

**Enchufe:** después de E5 (necesita calor de cañón y pintado). **Est.: 2–3 días.**
**✅ 14/8: la dependencia ya está.** E5 metió el calor (constantes compartidas con el pasillo) y
el pintado, así que S1 tiene de qué agarrar sus dos posiciones. Falta la tecla — ver §6.

### S2 · Drift — el viraje desacoplado ⭐⭐⭐

**En Squadrons:** cortar potencia + derrapar deja a la nave deslizando por inercia mientras el
morro apunta a otro lado. LA maniobra de reposicionamiento del juego.

**Problema que resuelve acá:** §2 del plan midió gap medio entre pasadas ~7 s — la mayoría del
tiempo se va volando LEJOS del buque. E3 ya propone el viraje de combate (media vuelta ~1,2 s);
el drift es su hermano continuo y más expresivo.

**Implementación:** con FRENO sostenido ([F]/L2, ya existe en el modelo: `SPD_BRAKE: 0.6`) +
banqueo pleno, la trayectoria conserva el vector viejo durante ~0,8 s mientras yaw/pitch giran
el morro — en `core/aero.js` es interpolar `fwd` de la POSICIÓN aparte del `fwd` del MORRO
durante la ventana (hoy son el mismo vector, `arena.js:228`). El cañón dispara por el morro
ya desacoplado: la pasada de "pasar de largo Y seguir tirando" nace sola.

**Enchufe:** ES parte de E3 (mismo ejecutor, misma salida medible: gap ≤ 4 s). **Est.: 1–2
días encima de E3.**

### S3 · El sweet spot de velocidad ⭐⭐

**En Squadrons:** el giro más cerrado está a ~50% de potencia. Ir a fondo te hace peor.

**Acá ya está a medio camino:** `turnRadius(spd)` en `core/aero.js:93` — el radio YA depende
de la velocidad. Falta que el jugador lo sepa y lo use: con freno el viraje aprieta
(`yawRateAt` podría escalar suave con `1/spd`), y el HUD lo enseña con un tick de "mejor giro"
en la cinta de velocidad (S6). **Enchufe: dentro de E3, gratis en la práctica. Est.: horas.**

### S4 · Subsistemas con EFECTO mecánico ⭐⭐⭐ — el mejor regalo de Squadrons

**En Squadrons:** volar el generador de escudos APAGA los escudos; los sistemas de puntería,
la precisión de las torretas. Elegir el orden de blancos ES la estrategia de Fleet Battles.

**Acá está al 20%:** las zonas existen (AA, RADAR, PUENTE, MOTOR, DEPOSITO — `MOM_LAYOUTS`) y
UNA ya tiene efecto: radar muerto = flak sin predicción (`arena.js:326`, y es la mejor regla
del modo hoy). Las demás son solo HP con puntos. Completar la tabla:

| Zona | Efecto al morir (propuesto) | Costo |
|---|---|---|
| RADAR | *(ya está)* flak deja de predecir | — |
| PUENTE | las AA dejan de coordinarse: no más salvas/barreras de E7; cadencia −30% | bajo |
| MOTOR | el buque se frena (cuando navegue, E9.3) y la ESCORA de E8 empieza antes; hoy: humo denso que da cobertura visual en un sector | bajo |
| DEPOSITO | explosión en cadena: daño a las zonas ADYACENTES del layout (*Desert Strike*) + incendio persistente | medio |
| AA | *(ya está)* menos flak — pero E7 invierte la curva con los umbrales | — |

Cada efecto se ANUNCIA por radio (E7 ya planea el canal): "PERDIERON EL PUENTE — TIRAN SIN
ORDEN". Sin el anuncio el efecto no existe para el jugador.

**Enchufe:** junto con E7 (comparten la lógica de fases y radio). **Est.: 1–2 días.**

### S5 · Lock enemigo + contramedidas ⭐⭐

**En Squadrons:** el tono de lock que sube de frecuencia es EL generador de pánico, y las
contramedidas son la decisión de gastarlas ahora o aguantar.

**Acá:** E7 ya planea un misil antiaéreo guiado en la fase de desesperación (30%). Lo que
Squadrons suma: (a) el **tono de lock escalonado** (buscando → fijado → lanzado), que es solo
audio + una luz en cabina; (b) **BENGALAS limitadas** (2 por avión, no regeneran): rompen el
lock si se sueltan en la ventana corta — gastarlas antes de tiempo es el error clásico y
delicioso. El quiebre físico (E7: "hay que quebrar") sigue siendo la salida sin bengalas.

**Enchufe:** dentro de E7. **Est.: 2 días** (el misil ya está presupuestado en E7; esto es el
audio, la luz y el ítem bengala).

### S6 · La cabina VIVA (instrumentos diegéticos) ⭐⭐

**En Squadrons:** la información vive en el tablero, no flotando — por eso la cabina se siente
un lugar y no un overlay.

**Acá:** la cabina ya es un asset terminado y la vista DEFAULT (decisión del autor 26/7,
`arena.js:70`). Hoy es un marco muerto. Darle vida: aguja de velocidad con el tick de mejor
giro (S3), indicador de pips (S1), luz de lock (S5), integridad del buque como lamparitas de
zona, y el aviso EL MAR — ARRIBA parpadeando EN el tablero. A 480×270 son ~5 elementos de
pocos píxeles — legibilidad primero, nada de miniatura ilegible.

**Enchufe:** con E8 (es legibilidad pura). **Est.: 2–3 días.**

### S7 · Fases con presión externa: la CAP ⭐

**En Squadrons:** Fleet Battles alterna fases (cazas → corbetas → capital) y el ritmo
ataque/defensa lo marca un medidor de moral.

**Acá:** E9.1 ya lo tiene mejor resuelto que Squadrons para este juego — el reloj de la
patrulla de Harriers cuyo vencimiento NO es derrota sino contenido (aparecen los cazas).
Este doc solo suma el matiz Squadrons: cuando la CAP llega, el buque ENTRA EN DEFENSA (cadencia
de flak baja mientras los Harriers te persiguen — dos presiones que se turnan, no se suman).
**Enchufe: E9.1, sin costo extra al implementarlo ahí.**

### S8 · Loadout antes de la batalla ⭐

**En Squadrons:** componentes por nave antes de volar. **Acá:** E9.2 ya planea las cartas
entre batallas del run. El matiz: que una carta sea de CARGA (más misiles / bengalas extra /
tanque liviano = +turbo). Mismo sistema, cero sistemas nuevos. **Enchufe: E9.2.**

---

## 3. La vista: cabina y 3ª persona — decisión

**Recomendación: mantener las DOS, como ya están.** Squadrons es solo-cabina por dos razones
que acá NO aplican: VR (no hay) y equidad competitiva (no hay multijugador). Y RASANTE ya pagó
la cabina (asset terminado, default) y ya tiene la 3ª en [V] (`toggleView`, `arena.js:90`).
Quitar la 3ª no compra nada; mantenerla cuesta cero.

- **Cabina queda como DEFAULT** — es donde S1/S5/S6 pagan (pips, luz de lock, tablero vivo).
- **La 3ª queda en [V]** para quien prefiera leer el avión — con una deuda conocida: el sprite
  "se ve tosco girando" a esta resolución (`arena.js:70`). Si algún día se quiere PROMOVER la
  3ª, el ítem es de arte (más frames de rolido, pipeline `tools/bake_planes.html` — está en el
  backlog E2.4 de VISUAL_UPGRADES.md), no de código.

---

## 4. Plan integrado — el orden que conviene

El orden del plan madre se respeta; las S se intercalan donde dependen:

| Paso | Qué | Est. | Salida medible |
|---|---|---|---|
| ~~1~~ | ✔ **E3 + S2 + S3** *(14/8)* — media vuelta, drift, sweet spot | hecho | media vuelta **1,08 s** (vs 2,6 banqueando) · drift **48°** · radio **43 m** frenado vs 134 con turbo |
| ~~2~~ | ✔ **E5** *(14/8)* — GUN_RANGE 380, balística, calor, misil por pintado, recarga por pasada limpia | hecho | dist. media **339 m** · **0 daño desde 600 m** · pasadas: pendiente de jugar |
| ~~3~~ | ✔ **S1** *(15/8)* — pips de energía | hecho | punta **161 / 180 / 111** m/s · calor **0,59 vs 0,09** · pintado **0,37 vs 0,24 s** |
| ~~4~~ | ✔ **E6** *(15/8)* — stagger, burbuja, patrones de trazadoras | hecho | **20–33 amenazas/min** adentro · **0 patrones** afuera · zona abierta ×2,5 |
| 5 | **E7 + S4 + S5** — fases, efectos de zona, lock + bengalas | 4–5 días | batalla ≤ 80 s; cero muertes no telegrafiadas |
| 6 | **E8 + S6** — legibilidad, cabina viva, muerte del buque | 4–5 días | se entiende sin HUD |
| 7 | **E9 + S7 + S8** — CAP, run, buque que navega, bases | (contenido, por fases propias) | — |

**Total pasos 1–6: ~4 semanas al ritmo actual.** Cada paso es shippeable y el modo mejora en
cada uno — no hay "big bang".

## 5. Qué NO copiar de Squadrons (prohibido por diseño)

- **Escudos** — diluyen la letalidad que sostiene la tensión. La supervivencia acá es esquivar.
- **6DOF / invertir el mundo** — `ROLL_MAX: 1.4` (80°) es techo a propósito: nunca invertido,
  el mar siempre abajo. El juego es RASANTE, no espacial.
- **La sopa de HUD** (3 medidores + minimapa + lista de blancos): a 480×270 la pantalla no da.
  El presupuesto de HUD del arena ya está gastado; S6 REPARTE info a la cabina, no la suma.
- **Reasignar potencia con menú radial** — una tecla que cicla 3 estados, nada más.

## 6. Controles — propuesta (decisión abierta D-S1)

> **⚠️ Actualización 14/8: `[R]` YA NO ESTÁ LIBRE.** Se la llevó el **viraje de combate** de E3
> (y **◯** en el mando), que era el paso 1 y llegó primero. Cuando entre S1, los pips necesitan
> otra tecla: `[G]` sigue libre y es la propuesta, con `[H]` para la bengala. El razonamiento de
> abajo sigue valiendo — lo único que cambió es qué tecla quedó tomada.

La tecla de pips es la única nueva. **[TAB] NO sirve**: es misil en todo el juego
(`core/input.js:210`, `Z o TAB`). Propuesta con teclas verificadas libres en arena:
**[R]** cicla pips, **[G]** suelta bengala. En mando, la cruceta tampoco está libre (es
esquive) y L3/R3 son del reproductor — el botón queda como decisión abierta (candidato:
Y/triángulo, verificar contra el mapeo de `pollPads`). Si el autor prefiere no sumar teclas,
S1 puede vivir en doble-toque de ← → (que en arena solo derrapan fino) — decisión suya.

## 7. Verificación

- Las sondas ya existen y son el criterio: `__adbg` (estado de vuelo), `__ahist` (histograma
  de distancias de tiro + gaps entre pasadas), `__aset` / `__akill` (posicionar y terminar).
- Cada paso del §4 cierra con: `npm run check` verde + una corrida de sonda que imprima la
  métrica de salida de ese paso + screenshot A/B si cambió algo visible.
- S1: sumar contador de cambios de pip a la sonda (`__ahist`), para saber si SE USA — un
  sistema de energía que nadie toca es peso muerto y se saca.

## 8. Decisiones abiertas (para el autor)

- ~~**D-S1** — tecla de pips~~ ✔ **cerrada 15/8: `[G]` y cruceta arriba.** Queda abierta solo la
  de la **bengala** (S5) — candidata `[H]`, sin decidir el botón del mando.
- **D-S2** — ¿el drift consume algo (turbo/combustible) o es gratis con freno? Propuesta:
  gratis — el costo ya es la velocidad perdida (`SPD_BRAKE: 0.6` te deja lento y blando).
- **D-S3** — bengalas: ¿2 fijas por avión, o carta de loadout (S8) las sube a 4?
- **D-S4** — ¿el efecto del DEPOSITO (cadena) puede matar zonas enteras solo, o deja todo
  en 1 hp? Propuesta: deja en 1 hp — el remate es del jugador, la pirotecnia del buque.
