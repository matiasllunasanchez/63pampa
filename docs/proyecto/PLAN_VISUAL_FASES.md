# PLAN VISUAL POR FASES — el frente visual completo, en tandas delegables

> **Qué es:** EL plan de implementación del frente visual entero, en fases. Ejecuta la
> "Estrategia global (16/8)" de [VISUAL_UPGRADES.md](VISUAL_UPGRADES.md) y le SUMA los
> frentes pedidos por Matías el 16/8: **ambientes y fondos · sensación de vuelo · assets
> de aviones · efectos de piruetas · efectos de armas · enemigos más vivos.**
>
> **Cómo se relaciona con los otros docs:** lo que ya tiene spec detallado NO se duplica —
> este plan lo agenda y apunta (E0/E1 → VISUAL_UPGRADES · agua → SPEC_AGUA_OLAS · clímax →
> SPEC_MODO_PASADA). Lo NUEVO (tandas 2, 4, 5, 6 y 7) está detallado ACÁ.
>
> **Cada TANDA es delegable a una sesión de implementación** (Opus medio alcanza para
> todas salvo la 7, que conviene en alto). Una tanda por sesión, en orden.

## 0. Reglas de oro (aplican a TODAS las tandas)

1. **El feel es sagrado**: `core/physics.js`, `waveNow`, `multOf` y toda constante de
   vuelo no se tocan. `npm run feel` da idéntico en todas las tandas — salvo la fase
   marcada **[GAMEPLAY]** (T5.N6), que es la única que puede cambiar dificultad y va
   aparte, con perilla y con ok explícito del director.
2. **Ningún efecto mueve la mira ni agranda un hitbox.** Los efectos son presentación.
3. **Nada de hit-stop** (congelar el mundo un instante al impactar): pausa el reloj de
   todos los sistemas = gameplay. El énfasis de un golpe se hace con flash + shake + zoom
   de cámara, nunca frenando el mundo.
4. **Sobriedad militar**: vapor, humo, sal, chispas — sí. Humo de colores de festival
   aéreo, arcoíris de partículas — no. Esto es 1982 y es una guerra.
5. Las **trampas conocidas del repo** están en SPEC_AGUA_OLAS §1 (bundle viejo, `life` en
   los fx, flicker por `Math.random` por frame, dos espacios de coordenadas, stores,
   señales, strings) — leerlas antes de CUALQUIER tanda. Van a doler si no.
6. Gate de TODA tanda: `npm run check` completo verde + capturas A/B (antes/después) de
   las escenas que la tanda toca + los fixtures propios que existan (`agua`, `pasada`).
7. Perillas SIEMPRE en `data/tuning.js` (o el data del sistema), con `0 = apagado` para
   poder A/B en playtest.

## 1. El mapa completo

| tanda | qué | detalle en | estado | est. |
|---|---|---|---|---|
| **T1 · LA LUZ** | glow aditivo + reflejo en el agua + tinte por misión (E0) | VISUAL_UPGRADES E0.1–E0.3 | ⬜ delegable YA | 3–4 d |
| **T2 · EL AIRE** | sensación de velocidad, vapor de piruetas, clima vivo (relámpagos, nubes, estrellas) | **acá §3** | ⬜ | 3–4 d |
| **T3 · EL AGUA** | mar con clima + olas obstáculo (F0–F7; F8 NO) | SPEC_AGUA_OLAS | ⬜ delegable YA | 4–6 d |
| **T4 · LAS ARMAS** | cañón (casquillos, impactos por material), misil (drop-ignite, estela), bomba (en PASADA P5) | **acá §5** | ⬜ | 2–3 d |
| **T5 · ENEMIGOS VIVOS** | AA que trackea, mar que los mueve, rotor-wash, banking, aves que se dispersan | **acá §6** | ⬜ (N2 depende de T3) | 3–4 d |
| **T6 · EL AVIÓN** | daño visible por averías, tobera por estados, rolidos intermedios | **acá §7** | ⬜ (P3 espera arte) | 2–3 d |
| **T7 · EL BUQUE 3D** | los tres cascos por clase con piezas nombradas — la deuda nº 1 | **acá §8** | ⬜ | 4–6 d |
| **T8 · CIERRE 3D** | agua F8 (mar 3D + espuma de proa) tras PASADA P5 y T7 | SPEC_AGUA_OLAS F8 | ⬜ bloqueada | 1–2 d |
| **T9 · POST-PRO** | pipeline WebGL + grading + bloom (CRT/distorsiones a criterio) | VISUAL_UPGRADES E1 | ⬜ | 4–6 d |
| **PRODUCCIÓN** | arte en paralelo, sin código — §10 | RETRATOS + PENDIENTES | ⬜ arranca HOY | continuo |

**Dependencias duras:** T5.N2 ← T3.F0 (necesita `core/sea.js`) · T8 ← T7 + PASADA P5 ·
T9.bloom ← T1.glow · T6.P3 ← producción de hojas. Todo lo demás es secuencial por
prolijidad, no por dependencia.

**Conflictos de archivos** (por qué el orden es serial): `render/world.js` lo tocan T2, T3
y T5 · `render/plane.js` lo tocan T1 y T6 · `three-arena.js` lo tocan PASADA, T7 y T8.
Una tanda por vez y no hay pisadas.

## 2. T1 — LA LUZ *(sin cambios: ejecutar VISUAL_UPGRADES E0.1 → E0.2 → E0.3 tal cual están escritos)*

Gate extra: captura nocturna (m13/m14) A/B — es donde el glow paga el boleto.

## 3. T2 — EL AIRE: velocidad, piruetas y clima vivo

### T2.V1 · Sensación de velocidad *(sin tocar la velocidad real)*
- **Lo que ya hay**: `streaks` (líneas de velocidad radiales) y `gusts` (ráfagas cruzando
  el cielo) en `core/world.js`. Localizar quién los emite y con qué frecuencia.
- **Reforzar**: con turbo, ×2.5 de emisión de `streaks` + más largas; a ras (≤4.5) motas
  de aire rasando el borde inferior de pantalla (rápidas, 1px, deterministas).
- **Zoom-punch de cámara**: al ACTIVAR turbo, `camZ` retrocede un 6% en 150 ms y vuelve
  (perilla `CAM_PUNCH = 0.06`; 0 = apagado). La mira NO se mueve (regla 2). Localizar
  `camZ` en `game.js` (la cámara aún vive ahí — ARQUITECTURA).
- **Micro-shake de Mach**: con turbo sostenido >2 s, `run.shake` mínimo de 0.4 constante
  (vibración de estructura). Ya existe `run.shake`; solo se le pone piso condicional.
- **CA:** con turbo, un espectador nota "va MÁS rápido" en una captura en movimiento;
  `npm run feel` idéntico (nada de esto toca `run.spd`).

### T2.V2 · El vapor: piruetas y Gs *(el aire se ve cuando se lo exige)*
- **Estelas de puntas de ala**: hilos de vapor blancos desde las dos puntas mientras
  `run.mv` está activo (el dueño del avión durante la pirueta es `systems/moves.js` — el
  emisor va AHÍ, el dibujo por el camino de partículas existente). Vida 0.7 s, se curvan
  con la trayectoria, alpha que muere suave. **Toda partícula con `life`** (trampa §1.5).
- **Vapor de G en viraje fuerte**: mismo efecto, más corto (0.3 s), cuando |vx| > 80% del
  tope + turbo. Emisor en el integrador de vuelo (localizar el punto donde ya se decide
  el banking) — SOLO lectura de estado, cero escritura de física.
- **El sello de la pirueta**: al completarse un combo (donde hoy sale el popup de la
  pirueta), un burst único de 6–10 motas blancas desde el avión. Nada de colores.
- **CA:** el TONEL deja un tirabuzón de vapor legible en 3ª persona; captura A/B.

### T2.V3 · Clima vivo *(ambientes y fondos, la parte de código)*
- **Relámpagos** (cielo `storm`, y m9): flash de 2 frames (velo `lighter` blanco-azulado
  al 18%) + las siluetas del mundo un tono más claras ese frame + trueno retardado 1–2 s
  (grave, vía `boom()`). Cadencia 20–40 s, determinista por semilla de misión (no
  `Math.random` por frame — es un EVENTO, se sortea al programarse el siguiente).
- **Nubes bajas extra**: 2 capas de scud (jirones) con parallax distinto en
  `storm`/`cloudy`, por delante del degradé de cielo y detrás del mundo. Deterministas,
  se desplazan con el viento de la misión (coherencia con agua T3.F2).
- **Estrellas** en `night`/`moon`: campo fijo determinista, titileo lento por seno. En
  `moon`, 1 estrella fugaz cada 60–120 s (evento, mismo patrón que el relámpago).
- **Humo lejano en el horizonte** (misiones de buque): una columna gris tenue en el rumbo
  del objetivo desde media misión — ambienta Y orienta (el buque "existe" antes de verse).
- **CA:** capturas de m9 (relámpago congelado), noche (estrellas) y una misión de buque
  (humo lejano). El smoke sigue verde (el canvas cambia — ahora más que antes).

## 4. T3 — EL AGUA *(sin cambios: ejecutar SPEC_AGUA_OLAS F0–F7 tal cual; F8 queda para T8)*

## 5. T4 — LAS ARMAS

### T4.A1 · El cañón
- **Casquillos**: 1–2 px eyectados lateralmente por ráfaga, parábola corta, vida 0.5 s,
  cap de 8 vivos (perf). Emisor donde nace la bala (localizar en el sistema de disparo);
  dibujo por el camino de `parts`.
- **Humo de boca**: tras >1 s de ráfaga continua, humito gris acumulándose en las bocas
  que se disipa al soltar. Con el glow de T1 encima, la boca "quema".
- **Impactos por material** (en `collision.js` YA se decide qué se golpeó — emitir ahí el
  fx correspondiente SIN tocar el daño): metal = chispas naranjas + 1 rebote trazador
  visual cada ~6 impactos (ricochet, solo estética); tierra = polvo; agua = splash (ya
  existe). **CA:** disparándole a una fragata, a una carpa y al mar se ven TRES respuestas
  distintas sin leer nada.

### T4.A2 · El misil
- **Drop-then-ignite**: 0.15 s de caída libre desde el ala ANTES de encender el motor
  (puro render/fx del proyectil ya existente — el timing de daño no cambia).
- **Estela de humo persistente**: 1.2 s de vida, se curva con el viento de la misión.
- **Glow del motor**: reusar la perilla de T1.
- **CA:** en 3ª persona el lanzamiento se lee en tres tiempos (suelta → cae → enciende).

### T4.A3 · La bomba de la PASADA → **NO va acá.** La sombra creciente sobre el agua y el
silbido de caída se hacen DENTRO de la P5 de la PASADA (ya anotado en su spec) — regla de
tránsito: los archivos de la pasada tienen un solo dueño.

## 6. T5 — ENEMIGOS MÁS VIVOS

### T5.N1 · La AA trackea
El caño de la AA (y del `aatruck`) se dibuja POR CÓDIGO encima del sprite horneado: una
línea de 2–3 px que apunta al avión con interpolación lenta (0.8 s de retardo — se ve
"siguiéndote", no clavada). Fogonazo en la boca sincronizado con su disparo real (el `cd`
ya existe en el obstáculo). **CA:** pasar al lado de una AA y VERLA girar hacia vos.

### T5.N2 · El mar los mueve *(depende de T3.F0 — `core/sea.js`)*
La fragata y la `lcu` **cabecean y rolan** con `seaH` en su posición (offset de y + 1–2°
de inclinación del sprite). Con clima `storm`, más. **CA:** captura de fragata en calma
vs tormenta — se nota sin señalarlo.

### T5.N3 · El helo
- **Rotor-wash**: cuando vuela bajo sobre agua, anillo de spray desplazándose con él
  (reusar el camino de spray de T3/rain). Sobre tierra: polvo.
- **Banking**: el sprite se inclina hacia donde deriva (el escorzo por yaw ya existe —
  esto suma el rolido lateral, 2–3°).

### T5.N4 · El jet
Banking en sus cruces (inclinación hacia el centro de su curva) + estela de condensación
corta cuando cruza rápido y alto. Nada de IA nueva: es vestir la trayectoria que ya vuela.

### T5.N5 · Las aves
Dispersión reactiva: cuando el avión pasa a <12 unidades, burst único de velocidad
aleatoria por ave (una vez, con flag en el obstáculo) — la bandada EXPLOTA hacia los
costados. Barato y vivísimo.

### T5.N6 · [GAMEPLAY] Patrones de movimiento nuevos — **decisión aparte, NO entra sola**
Weave del jet, arcos del helo, globo que ondula: cambian la dificultad del esquive. Si el
director da el ok: perilla propia en la fila ENEMIGOS de OPCIONES, apagada por defecto,
y prueba de balance en m2 y m9 antes de encender en campaña. **Este ítem es el ÚNICO de
todo el plan que puede tocar el feel del esquive.**

## 7. T6 — EL AVIÓN DEL JUGADOR

### T6.P1 · El daño se ve *(engancha con el sistema de AVERÍAS ya construido — OPCIONES, 3 modelos)*
Localizar el estado de avería (commit `b52d32f`). Por nivel: leve = hilo de humo gris
intermitente · media = humo continuo más oscuro + chispas eventuales de la turbina ·
crítica = humo negro + llama intermitente. En 1ª persona (ARENA/PASADA): vibración extra
del marco de cabina con avería crítica. **CA:** de un vistazo en 3ª persona sabés cómo
venís SIN mirar el HUD.

### T6.P2 · La tobera por estados
Llama corta (crucero) / media (gas sostenido) / larga con anillos de mach (turbo) /
**flameout** (tanque seco: la llama tose y muere — el aviso visual de la nafta). Se apoya
en el glow de T1. **CA:** los 4 estados se distinguen en captura.

### T6.P3 · Rolidos intermedios *(integración — espera al carril de producción)*
Cuando las hojas nuevas salgan de `tools/bake_planes.html` (§10): integrar frames extra
(`data/planes.js` `SHEET_NF`/filas + `render/plane.js`). Hasta que el arte exista, esta
fase no tiene trabajo.

## 8. T7 — EL BUQUE 3D POR CLASE *(la deuda visual nº 1 — sesión en esfuerzo ALTO)*

**Objetivo:** reemplazar el placeholder de cajas de `ship3d.js` por TRES cascos low-poly
flat-shaded (sin texturas — el look del juego), uno por clase, con piezas nombradas:

| clase | silueta que la identifica | piezas mínimas |
|---|---|---|
| `t42` (Sheffield, Coventry, Glamorgan) | proa lanzadera + mástil grande | casco, puente, mástil+radar (rota), lanzador Sea Dart, cañón 4.5" a proa, chimenea |
| `t21` (Ardent, Antelope, Broadsword) | baja y rápida, hangar a popa | casco, puente, mástil, cañón, hangar+plataforma helo |
| `log` (Conveyor, Galahad, Tristram) | alta, contenedores/grúas | casco alto, superestructura a popa, 2 grúas, cubierta de carga |

- **Las zonas se anclan a piezas reales** (`userData.zone` ya existe y el daño por zona ya
  corre): zona muerta = pieza ennegrecida + humo desde la pieza (no desde el centro).
- Paleta: los grises/azules de `P` + óxido en la línea de flotación; luces de posición
  (rojo babor / verde estribor / blanco tope) — de noche, con el glow, el buque VIVE.
- Escala: mantener `SHIP_LEN` y `shipU`/`shipDeck` (metros reales — no romper el ARENA).
- **CA:** a 700 m se distingue la clase por silueta; a 300 m se leen las zonas SIN
  carteles (esto le permite a PASADA P5 bajar la mitad de sus carteles — coordinar);
  `npm run pasada` y el smoke del ARENA re-verdes; el fallback 2D (`momentum.js`) intacto.

## 9. T8 — CIERRE 3D *(SPEC_AGUA_OLAS F8: mar 3D ondulando + espuma de proa — recién cuando PASADA P5 esté cerrada y T7 adentro)*

## 10. T9 — POST-PRO *(VISUAL_UPGRADES E1: F1 pipeline → F2 grading → F3 bloom; F4 CRT y F5 distorsiones SOLO si el juego lo pide tras ver F3)*

## 11. CARRIL PRODUCCIÓN *(paralelo desde hoy — arte, sin código)*

En orden de retorno:

1. **Placas VN** (~16, RETRATOS §3) → 2. **Retratos neutros** (los 9 de `CARA_NEUTRA`) →
   3. **Variantes de expresión** clave → 4. **Cuadros de M1** (la demo) y siguientes.
   *(El enchufe ya corre con silueta mock: cada PNG aparece solo. Al PRIMER PNG real:
   dar vuelta el guard de `tools/build_web.py` — VISUAL_UPGRADES E2, nota.)*
2. **Fondos de terreno** (`assets/world/terrain_back/`): 2–3 climas nuevos (amanecer de
   tormenta, noche cerrada) — entran por `TBACK_MAP` + preset (ARQUITECTURA "¿dónde voy?").
3. **Hojas de avión**: rolidos intermedios (habilita T6.P3) → poses del caza DESDE ATRÁS y
   de VIRAJE (habilitan la persecución futura, PENDIENTES §13) → el Harrier.
4. Regla de todas las tandas de arte: **se miran adentro del juego, mudas**, antes de
   encargar la siguiente.

### 🟩 Auditoría de las imágenes del juego *(21/8)*

Se revisaron TODOS los assets de imagen del repo contra el estilo de la casa (pixel art Metal
Slug, el mismo de las hojas de personaje y de avión). **La conclusión es buena: la mayor parte
está bien y no hay que tocarla.** Lo que sigue son las tres excepciones, ordenadas por lo que
mueven.

| Frente | Estado | Veredicto |
|---|---|---|
| `photos/ppal` (14), `photos/win` (5), `photos/lose` (6) | pixel art dithered, ambiente correcto, buena densidad | ✅ **no tocar** |
| `world/enemies` (13) | renders chicos horneados desde 3D; en juego miden 10-40 px | ✅ **no tocar** — el detalle no se ve a esa escala |
| `world/terrain_back` (6) | fondos grandes, en estilo | ✅ ya agendado arriba (2-3 climas nuevos) |
| **`planes/*/preview`** (6) | **cel-shading vectorial**: línea negra gruesa y relleno plano | ❌ **rehacer** |
| **`world/soldats`** (4) | hoja genérica de asset pack, oscura, con los rótulos de animación en inglés impresos encima | ❌ **rehacer** |

#### 1 · Las ilustraciones del menú de avión — el pipeline ya está escrito

Son la única pantalla del juego que se ve de otro juego: **cel-shading vectorial contra pixel
art en todo lo demás.** El método, los prompts por avión con sus hexadecimales reales, y los
prompts de corrección están en
[AVIONES_CATALOGO.md](../historia/AVIONES_CATALOGO.md) §"Generar las ILUSTRACIONES del roster".

El truco que lo hace confiable: **se le da de comer el cuadro central de la propia hoja de
sprites** (`col 4, fila 1` de `sheet.png`, escalado ×4 sin suavizar). Eso fija la pose, la
silueta y la paleta de una, y garantiza lo que hoy no está garantizado — que la ilustración
del menú y el avión que volás sean el mismo avión.

**Esfuerzo:** 6 imágenes, cero código. Es el mejor retorno por hora de todo este carril.

#### 2 · Los soldados — el asset más pobre, y arrastra un bug

`world/soldats/englishsoldatv2.png` es una hoja de asset pack: paleta oscura, poco contra el
terreno, y **los rótulos de animación de la hoja impresos encima de los frames** (el propio
`render/soldiers.js` documenta que tuvo que correr la caja del frame 0 para esquivar la
etiqueta verde). No es Metal Slug y no es 1982 argentino.

> ⚠️ **El bug que apareció auditando:** `render/soldiers.js:1` tiene **una sola hoja
> hardcodeada — la INGLESA — y con ella dibuja a todos los soldados del juego.**
> `argentinesoldatv2.png` existe (968 KB, misma grilla de 931×1024) y **no lo usa nadie**.
> Además `systems/spawn.js:85` no le pone bando al soldado: el dato no existe en el modelo.
>
> Hoy **no se ve**: en el pasillo el soldado mide 8-20 px con `SMOOTH = true`, y a esa escala
> los uniformes no se distinguen. Es una deuda **latente**, y explota en el primer plano
> cercano — o sea en el nivel de tierra (ROADMAP #16) y en el minijuego del piloto (#24), que
> son justamente los dos ítems que harían falta para que los soldados importen.
>
> **En un juego cuya tesis es "a los que pelearon, de los dos lados, este juego los respeta
> por igual", que todos los soldados sean ingleses no es un detalle técnico.**

**Orden correcto:** primero el campo `side` en el spawn (barato, y sin él no hay nada que
dibujar distinto), después el arte. Rehacer la hoja antes de eso es pintar algo que el juego
no puede usar.

#### 3 · Lo que falta y ya está arriba en esta misma lista

Placas VN, retratos y cuadros de historia siguen en **cero PNG** con el enchufe andando. Eso
no cambió y sigue siendo el punto 1 del carril: es lo que convierte el modo historia de
"pantallas de texto" en un juego.

### El faltante estructural: no hay una biblia de estilo

Cada frente tiene su prompt (hojas de personaje, hojas de avión, previews del roster), y los
tres repiten el mismo bloque de estilo copiado a mano. **No existe un archivo que diga "así se
ve RASANTE".** Mientras sean tres, se aguanta; cuando alguien genere el cuarto frente sin
haber leído los otros tres, el juego se empieza a desarmar de a poco y nadie sabe por qué.

Lo que tendría que fijar, en una página: el bloque de estilo canónico (uno, citable), la
paleta (`data/palette.js` ya la tiene), el trato de la línea y el dithering, el fondo, la
regla de "sin texto", el period lock, y los tres canastos de época de
[AVIONES_CATALOGO.md](../historia/AVIONES_CATALOGO.md). **Es media jornada y evita
retrabajo indefinido.**

## 12. Orden de arranque y delegación

- **HOY, en paralelo sin conflicto:** T1 (sesión de código) + carril producción (Matías).
- Después, serial: T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9. (T3 puede adelantarse a T2 si
  se prefiere gameplay antes que ambiente — no comparten archivos con T1 ya cerrada.)
- Kickoff tipo para cada tanda: *"Implementá la TANDA n de
  `docs/proyecto/PLAN_VISUAL_FASES.md`. Leé antes ARQUITECTURA.md y las reglas §0 y las
  trampas de SPEC_AGUA_OLAS §1. Una fase por vez, gate verde tras cada una, capturas A/B,
  divergencias anotadas al pie del plan. No toques nada fuera del alcance de la tanda."*

## 13. Divergencias y decisiones tomadas en implementación *(completar por tanda)*

- *(vacío)*
