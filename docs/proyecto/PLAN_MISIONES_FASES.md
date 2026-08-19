# PLAN POR FASES — el armado de las 14 misiones, una por una

> **Audiencia: una IA implementadora en sesión nueva.** Este es el CÓMO del
> [DISENO_MISIONES.md](DISENO_MISIONES.md) (que es el QUÉ y manda en toda decisión de
> diseño): el trabajo partido en fases chicas y **una misión por vez**, cada una con su
> criterio de cierre, para ir completándolas y probándolas AISLADAS con el selector de la
> Fase 0. Numeración canon de 14; el id de código actual entre paréntesis (hasta el
> remapeo R).
>
> **Antes de tocar código:** `docs/ARQUITECTURA.md` (manda) · `DISENO_MISIONES.md` §3–§4
> (la tabla maestra y el armado por misión) · [SPEC_TRAMOS.md](../sistemas/SPEC_TRAMOS.md)
> · `COMO_PROBAR.md` (el catálogo de sondas y fixtures que ya existen).

## 0. Cómo usar este documento

1. **El orden es el del tablero (§3).** Nunca más de una misión "abierta" a la vez.
2. Cada fase cierra con `npm run check` verde + el fixture que la fase nombre. Cada
   MISIÓN cierra además con su **criterio de aprobación** volado en el selector.
3. Los prerrequisitos (§2) se construyen **cuando la primera misión los necesita**, no
   antes — salvo S (el selector) y R (el remapeo), que van primero sí o sí.
4. Divergencias: las de mecánica van al spec que corresponda; las de misión, acá al §6.
5. ⚠ **Asserts que van a romperse A PROPÓSITO** (no son regresiones, son decisiones ya
   tomadas — cambiarlos con el commit que los rompe): la ventana de la Chancha en
   `fixture_chancha` (C1) · el unit "ninguna misión juega EL PULSO" (M14) · todo lo que
   cuente 12 misiones (R).

---

## 1. FASE 0 — EL SELECTOR DE MISIONES *(la herramienta; se construye ANTES que todo)*

**Qué es:** una fila **MISIONES** en el menú (patrón del submenú de JUEGO RÁPIDO /
campmenu), solo para desarrollo: lista las misiones de `MISSIONS` (nombre, fecha, goal,
clímax) y ENTER lanza **esa misión aislada** — sin campaña alrededor: al terminarla
(victoria o derrota + reintentos) se vuelve AL SELECTOR, nunca se encadena la siguiente.

**Reglas de diseño:**
- **Es una interfaz sobre sondas** (regla de oro de COMO_PROBAR §4): el lanzamiento vive
  en una sonda/parámetro — `?mision=<id>` y `window.__mision('<id>')` — y el selector
  solo la llama. Es exactamente la sonda que el futuro modo PRUEBAS pide (PR2): cuando
  PRUEBAS exista, este selector se muda adentro como una sección más.
- **Historia a elección:** el selector lanza SIN pantallas de historia por defecto
  (derecho al despegue — para eso existe); una tecla en la fila ([H]) alterna "con
  historia" para probar el guion de esa misión.
- **Higiene:** en modo selector no se escriben récords, saves ni `ups` (flag `testMode`,
  el mismo que va a usar PRUEBAS PR3). Fuera de campaña rigen TODAS las piruetas (ya es
  así por `moveAllowed` ✅). Badge `PRUEBA` en el HUD.
- **Visibilidad:** perilla en `data/` (visible siempre en dev; la decisión de ocultarlo
  en el build de Steam es de Matías, misma perilla que PRUEBAS).

| fase | entrega | criterio de cierre |
|---|---|---|
| **S0** | La sonda: `?mision=<id>` + `__mision(id)` lanzan la misión aislada (cfg completo de la misión, roster, clímax, chancha/nafta como en campaña) y el fin de misión vuelve al selector (o al menú si entró por URL) | por URL se juega cualquier misión suelta; DEBUG_STATE muestra `results/epilogue → selector`, jamás `brief` de la siguiente |
| **S1** | La pantalla: fila MISIONES + lista navegable con nombre/fecha/goal/clímax y el toggle [H] historia | se entra, se elige, se juega, ESC vuelve |
| **S2** | Higiene: `testMode` bloquea récords/saves/ups + badge PRUEBA | media hora de selector deja `localStorage` idéntico (fixture lo verifica) |
| **S3** | **`npm run misiones`** (`tools/fixture_misiones.js`): recorre TODAS las misiones por sonda con `?qa` — carga, despega, canvas vivo, llega al clímax que declara, 0 errores de consola | **la red de regresión de la campaña entera**, gratis para siempre; entra al hábito de correrla al cerrar cada misión |

---

## 2. Los prerrequisitos transversales *(se hacen cuando su primera misión los pide)*

### R · El remapeo 12→14 *(PLAN_CAMPANA_001; lo piden M3 y M10 — y toda la numeración)*
- **R0** Data: insertar EL INVENTO (M3) y LOS PRIMOS (M10); renumerar ids `m1…m14` al
  canon; remapear claves `storyM*/epiM*/briefM*` de `strings.js`; actualizar `SHIP_MISSIONS`,
  el par de estrellas y los rosters (el guion: 5 → 4 desde M8 → 3 desde M10).
- **R1** ⚠ Saves: un save viejo guarda índice de misión y `ups` — migración o
  invalidación explícita con aviso (decisión: invalidar con mensaje es aceptable en dev;
  anotarlo).
- **R2** Verificación: `npm run misiones` (S3) pasa con 14; los fixtures/smoke que
  contaban 12 se actualizan a propósito.
- Criterio: la campaña `?qa` entera corre M1→M14 con sus historias en orden.

### T · TRAMOS — [SPEC_TRAMOS.md](../sistemas/SPEC_TRAMOS.md) *(T0–T4; lo piden M1, M2, M4, M9, M10, M14)*

### C · La Chancha invertida + la nafta por misión *(DISENO §6–§7; lo piden M6, M7, M10, M13)*
- **C1** Ventana nueva: `chancha: true` SOLO en M7–M9; el resto sin poder (M1–M6: ni
  barra) y M10+ con la negativa `ch_broken` ("la Chancha no baja más al sur", línea
  nueva). ⚠ invierte el código actual — actualizar `fixture_chancha` y anotar en
  SPEC_PODER_CHANCHA §9.
- **C2** `nafta:` por misión (`'off' | 'normal' | 'justa'`): off = sin reloj (M1–M3),
  normal = hoy, justa = tanque ~75 y bidones raros. **En campaña pisa la perilla de
  OPCIONES; en los otros modos rige OPCIONES** como siempre.
- Criterio: fixture — M5 no muestra barra; M8 la Chancha viene; M10 contesta la negativa;
  M10 con vuelo sucio se queda sin nafta de verdad.

### U · Las mejoras: azar + póstumas *(DISENO §5; lo piden M3 y M9)*
- **U0** `nextUpgrades` nuevo: 1ª ventana (tras M2) fija = las dos primeras causales;
  después 2 al azar del pool no aprendido, EXCLUYENDO las póstumas (ASCENSO, SOBRE EL
  RADAR, TONEL BARRIL) hasta M9 inclusive; desde M9, pool completo. Sin oferta tras M13.
- **U1** Unit tests de la ventana (cuenta 11 ofertas, una mejora queda sin aprender, las
  póstumas jamás antes de M9) + la pantalla ya cambia BANCO→LIBRETA ✅.
- Criterio: unit verde + una campaña `?qa` muestra ofertas distintas entre dos corridas.

### H · Las marcas de Cóndor + la señal *(DISENO §4-M4/M5/M10; lo piden M4 y M10)*
- **H0** Marcas: puntitos en la barra de misión (los blancos que la radio dicta),
  encendidas por `marcas: true` del tramo vigente (el campo ya lo transporta
  SPEC_TRAMOS §2).
- **H1** La señal que va y viene (M10): `marcas` alternadas por tramo + estática de radio
  al perderla (beep + popup corto). Sin sistema nuevo: son tramos + un sonido.
- Criterio: M4 las tiene, M5 no (misma barra, el jugador siente el robo), M10 parpadean.

### E · La escena por evento en pleno vuelo *(hook F4 de SPEC_MODO_HISTORIA; lo piden M10 y M12)*
- La dispara un tramo (`radio:` no alcanza: es un campo nuevo `escena:` del tramo o el
  hook F4 por distancia — decidir con la arquitectura del modo historia, anotar). El
  vuelo pausa limpio → secuencia de pantallas (motor F1 ✅) → vuelve al MISMO punto del
  vuelo. Se construye UNA vez; la usan Tandil (M10) y el corte a tierra (M12).
- Criterio: entrar/salir de la escena no rompe racha, nafta ni relevo; el fixture de la
  misión lo mide.

### N · El numeral visible *(reuso de `persec.js`; lo pide M7 v2 — POSPONIBLE)*
- El Vasco ala con ala: un líder de persecución con offset lateral fijo, sin gate de
  puntaje. Su muerte scripted en la salida queda para M7 v2 (no bloquea M7 v1).

---

## 3. El tablero *(el orden de trabajo; ⬜ → ✅ a medida que se cierran)*

| orden | pieza | prerreq. | tamaño | estado |
|---|---|---|---|---|
| 1 | **S** el selector (S0–S3) | — | medio | ⬜ |
| 2 | **R** remapeo 12→14 | S3 (la red) | medio | ⬜ |
| 3 | **T** tramos (T0–T4, incluye M4 piloto) | — | chico | ⬜ |
| 4 | M1 | T · tambores | chico | ⬜ |
| 5 | M2 | T | chico | ⬜ |
| 6 | **U** mejoras | R | chico | ⬜ |
| 7 | M3 | R · U | chico | ⬜ |
| 8 | M4 (cierra con T4) + **H0** | T · H | chico | ⬜ |
| 9 | M5 | — | chico | ⬜ |
| 10 | **C** chancha + nafta | — | chico | ⬜ |
| 11 | M6 | C | chico | ⬜ |
| 12 | M7 v1 | C | chico | ⬜ |
| 13 | M8 v1 | — | chico | ⬜ |
| 14 | M9 | T | chico | ⬜ |
| 15 | **E** escena por evento | historia F4 | medio | ⬜ |
| 16 | M10 | R · T · C · H1 · E | medio | ⬜ |
| 17 | M11 | — | mínimo | ⬜ |
| 18 | M12 | E | chico | ⬜ |
| 19 | M13 | C | chico | ⬜ |
| 20 | M14 v2 | historia F5 | medio | ⬜ |
| — | M7 v2 (Vasco scripted) · M8 v2 (sobrevuelo jugable) · M9 v2 (depósito mayor) · M14 v3 (MISION_FINAL) | N / — / — / grande | después | ⬜ |

---

## 4. Las misiones, una por una

> Formato de cada bloque: **(a) data** (cfg/tramos/goal — `missions.js` + strings) ·
> **(b) contenido** (props, eventos, líneas nuevas) · **(c) prueba** (selector + medición
> por sonda) · **CIERRE** = el criterio que aprueba la misión. El detalle de diseño (por
> qué cada número) vive en DISENO_MISIONES §4 — no repetirlo acá: consultarlo.

### M1 — SAL EN LAS ALAS *(m1)* — tutorial puro
- **(a)** tramos: `[{hasta:.3, obstacles:.5, favor:['mast','birds']}, {hasta:.7, obstacles:.7}, {hasta:1, obstacles:.9}]`;
  `persec:1` ✅ ya está; bombs/caza 0 ✅.
- **(b)** 🔴 **el tambor flotante**: prop destructible inofensivo (HP mínimo, +150, no
  daña al chocar… decidir: mejor SÍ daña como todo — el guion dice "el peligro es el mar
  y la torpeza propia" — anotar la decisión), flota en el agua, fallback vectorial (un
  tambor naranja), entra a la mezcla SOLO por `favor`/tramo de esta misión.
- **(c)** selector + sonda: contar proyectiles ENEMIGOS durante toda la corrida = **0**;
  tambores derribables suman; el líder de persecución vuela el primer tercio.
- **CIERRE:** un espectador ve un tutorial — nadie te dispara nunca, y aprendiste el ras,
  el cañón y el multiplicador sin un cartel.

### M2 — BAUTISMO DE FUEGO *(m2)* — el fuego enemigo y LA COLA
- **(a)** `terrain: 'coast'` 🟡 (hoy mar); tramos: 0–0.4 suave (obst 1.0) · 0.4–1
  desembarco (1.4) con `favor: ['radar','aatruck','aa']` en el último cuarto (el "boss
  radar" del canon como cordón, propuesta A de DISENO).
- **(b)** nada nuevo: el desembarco entero ya existe ✅.
- **(c)** sonda: ≥4 radares/AA en el tramo final; LA COLA aparece al menos una vez
  (`caza:1`); primera misión donde el conteo de proyectiles enemigos es >0.
- **CIERRE:** el salto M1→M2 se SIENTE (de nadie te dispara → todos): esa es la brecha
  del guion.

### M3 — EL INVENTO 🔴 *(nueva — remapeo)* — la misión-escuela de las mejoras
- **(a)** misión nueva: dist 2400, costa suave, obst 0.7, cero caza/bombs; `story/epi`
  con el guion ya escrito (briefing del invento, epílogo de la arandela + el Belgrano).
- **(b)** blancos de oportunidad: tambores de M1 + radar móvil ✅ por `favor`.
- **(c)** campaña `?qa`: tras M2 aparece la 1ª oferta del banco (U), se elige, y M3 se
  vuela con la mejora puesta; selector: la misión suelta también carga una mejora de
  cortesía (testMode: las piruetas están todas ✅).
- **CIERRE:** la secuencia banco→misión liviana enseña la mecánica exactamente donde el
  guion la puso.

### M4 — EL DÍA QUE SANGRÓ EL MAR *(m3)* — el tránsito del Narwal *(la misión piloto de T4)*
- **(a)** tramos: 0–0.35 tránsito (obst 0.3, caza 0, `radio` ×3–4 claves de la
  conversación del Narwal, `marcas: true`) · 0.35–1 mar pleno (1.2, caza 1). Clímax
  PASADA ✅ default.
- **(b)** strings de la conversación (GUION_3 M4, ya escrita) + H0 (las marcas).
- **(c)** fixture de T4: 0 spawns hostiles en el tránsito, la radio en orden, marcas
  visibles, la PASADA entra al final.
- **CIERRE:** dos minutos de solo radio que no aburren — y el jugador USÓ las marcas sin
  saber que se las van a robar.

### M5 — EL CALLEJÓN DE LAS BOMBAS *(m4)* — clímax ARENA ✅
- **(a)** coast denso ✅ (obst 1.7); `marcas: false` (el robo — el delta contra M4);
  clímax `arena` ✅ ya en data.
- **(b)** nada nuevo (la escucha va en el epílogo ✅ escrito).
- **(c)** sonda comparativa M4 vs M5: mismas barras, sin marcas; la ARENA se juega y
  vuelve al selector.
- **CIERRE:** entrar a la misión más brava del movimiento con MENOS información en
  pantalla, y que se note sin un cartel.

### M6 — LA BOMBA QUE NO DESPERTÓ *(m5)* — la banda dormida se enseña acá
- **(a)** ✅ como está (sol, fog corto); al cierre, `chancha` pasa a disponible (C1).
- **(b)** 🟡 el popup pedagógico: la PRIMERA suelta dormida de la campaña agrega la línea
  de Puma del briefing (una clave de strings; después, el "NO DESPERTÓ" pelado ✅).
- **(c)** fixture: suelta a <20 m → popup + línea, una sola vez por campaña.
- **CIERRE:** el jugador que no leyó nada entiende el título de la misión al vivirla.

### M7 — 25 DE MAYO *(m6)* — v1
- **(a)** `caza: 2` (la salida es de ellos); `chancha: true` (C1 — primera misión con el
  poder).
- **(b)** v1: nada — la muerte del Vasco ya está en las pantallas del epílogo ✅. (v2 con
  el numeral N + evento scripted: tablero, "después".)
- **(c)** fixture: la Chancha llamable y viene en M7, no existe en M6; LA COLA aprieta.
- **CIERRE:** el poder se estrena la misión siguiente a conocerla — el arco de §6 del
  DISENO, en juego.

### M8 — EL BATIR DE ALAS *(m7)* — v1
- **(a)** ✅ como está (rain 1, squad 4). **(b)** v1: nada (el sobrevuelo en pantallas ✅).
- **(c)** selector limpio + `npm run misiones`.
- **CIERRE:** v1 aprobada = pasa limpia; el sobrevuelo jugable queda como el ítem más
  deseable del "después".

### M9 — EL PIBE *(m8)* — el infierno lleno
- **(a)** `terrain: 'coast'` 🟡 + tramos crecientes (1.7 → 2.2) + `favor:
  ['depot','aa','tent']` en el final; storm + rain 2 + bombs 2 ✅ (la REBELDE se habilita
  sola en tormenta ✅).
- **(b)** nada nuevo (propuesta A del DISENO: cordón denso, sin boss). Las CADENAS de
  destrucción ✅ hacen el espectáculo.
- **(c)** sonda: densidad final ≥2× la inicial; al menos una ola en la corrida; la
  rebelde avisa solo con escuadrón vivo ✅.
- **CIERRE:** la misión más intensa hasta acá — y el contraste con M10 queda servido.

### M10 — LOS PRIMOS 🔴 *(nueva — la más cara y la más distinta)*
- **(a)** misión nueva: dist 3600 (la más larga), mar, dusk→storm, fog LARGO, viento,
  obst 0.5, caza/bombs 0, squad 3; `nafta: 'justa'` (C2) con `bidones: false` en el
  último tercio (tramo); señal de Cóndor alternada (H1); `chancha: false` **con la
  negativa** (C1).
- **(b)** la escena de Tandil por evento (E) al ~55% + el desbloqueo MIRAGE (placa
  SISTEMA + avión en CICLO/ARENA/MINUTOS SAGRADOS — PLAN_CAMPANA_001 §7). v1 armable SIN
  E: Tandil va al epílogo hasta que E exista.
- **(c)** fixture: pedir la Chancha da `ch_broken`; volar sucio (turbo constante) se queda
  sin nafta ANTES del final; volar prolijo llega con <15%; la señal parpadea por tramos.
- **CIERRE:** la única misión que se gana VOLVIENDO — si el jugador termina con la aguja
  temblando y sin haber disparado, está bien hecha.

### M11 — LO QUE NO SE DICE *(m9)* — el respiro (es un test, no un desarrollo)
- **(a/b)** NADA. Ya está ✅ y el diseño es que no pase nada nuevo.
- **(c)** selector + `npm run misiones`.
- **CIERRE:** cero eventos, cero strings nuevos, cero commits de contenido. Si alguien le
  agrega algo, se equivocó de misión.

### M12 — EL ÁNGEL CORRENTINO *(m10)* — el corte a tierra
- **(a)** ✅ como está (dusk, bombs 2, rain 1, PASADA).
- **(b)** el corte a tierra al ~50% por evento (E) — la escena ya está escrita; v1 sin E:
  queda en el epílogo como hoy ✅.
- **(c)** fixture con E: el evento dispara UNA vez, el vuelo vuelve al mismo punto con
  racha/nafta/relevo intactos.
- **CIERRE:** "hay cosas que no pueden esperar al final del nivel" — la regla de montaje
  del guion, rota exactamente una vez en juego (la otra es Tandil).

### M13 — LA ÚLTIMA MESA *(m11)* — la noche y el sapito real
- **(a)** ✅ tierra + luna; `nafta: 'justa'` (C2).
- **(b)** 🟡 soldados AMIGOS decor bajo el vuelo (no puntúan, no sangran, no se pisan —
  el flag decor del sistema existente) + 🟡 el guiño del sapito contra el Broadsword (una
  clave de strings si la suelta sapito conecta acá).
- **(c)** fixture: imposible sumar puntos con los casquitos propios; el guiño aparece con
  el sapito y solo acá.
- **CIERRE:** la misión nocturna se LEE (luna + fog están para eso) y el que saca el
  sapito se lleva el secreto histórico.

### M14 — EL TERO *(m12)* — v2: el momento del misil
- **(a)** `climax: 'pulso'` — ⚠ cambiar a propósito el unit que hoy exige que ninguna
  misión lo use (PLAN_EL_PULSO div. 28: "ese assert es el que hay que venir a cambiar").
- **(b)** estado `ending` + las cadenas A/B en pantallas (historia F5) — los textos ya
  están escritos ✅; la decisión sin menú (izquierda = casa/Final B · derecha = oleada/
  Final A), flags de save (`final_visto`, `final_oculto`).
- **(c)** fixture: clímax → `ending` → cada tecla encadena SU final → victoria en ambos;
  DEBUG_STATE sin estados intermedios espurios.
- **CIERRE v2:** la campaña completa se termina de punta a punta con el examen de pulso
  como remate y los dos finales elegibles. (v3 — contrarreloj, Gitano/Puma scripted,
  vorágine y planeo — es MISION_FINAL.md y su propio plan.)

---

## 5. La regla del plan

Cada misión tiene **v1 cerrable sin esperar a nadie** (los eventos van a pantallas hasta
que E exista; los props nuevos entran por `favor` sin tocar mezclas). El selector (S) es
la primera entrega porque es el multiplicador de todas las demás: cada misión cerrada se
prueba en 30 segundos, y `npm run misiones` convierte el avance en red de regresión.

## 6. Divergencias del plan *(completar durante la implementación)*

- *(vacío)*
