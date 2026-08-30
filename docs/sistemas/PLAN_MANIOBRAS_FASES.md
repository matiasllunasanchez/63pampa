# PLAN — EL PROGRAMA DE MANIOBRAS: todas, una por una, en las tres presentaciones

> **Estado: plan por fases, sin implementar (16/8).** Ejecuta la decisión de Matías: cada
> maniobra del jugador/amigo existe en TRES presentaciones sobre los MISMOS beats —
> **(a) PODER del jugador** (combo → `moves.js` la vuela solo, como hoy) ·
> **(b) ACTOR AMIGO in-game** (un Fiel entra de costado o de atrás y la ejecuta) ·
> **(c) CABINA** (la misma maniobra en 1ª persona) — y cada una es **probable al instante**
> por sonda y por fixture, sin jugar campañas.
>
> **La estrategia del plan: cimientos primero.** Con tres obras de base (M0–M2), las
> **12 piruetas que YA existen** (tonel, barril, split-S, break, yo-yos, jink, s-turn,
> masking, pop-up, ascenso, sobre el radar, tirabuzón) ganan las tres presentaciones de
> una sola vez. Recién después entran las maniobras nuevas, UNA por fase, cada una con su
> diseño (el modelo es [PLAN_PIRUETA_VOLTERETA.md](PLAN_PIRUETA_VOLTERETA.md)).
>
> **Leer antes:** `docs/ARQUITECTURA.md` (manda) · trampas en `SPEC_AGUA_OLAS.md` §1 ·
> `src/data/moves.js` + `src/systems/moves.js` (el catálogo y su motor) ·
> `docs/sistemas/PROMPTS_MANIOBRAS.md` (el triage y las fichas) ·
> `docs/sistemas/PLAN_DIRECTOR_CINEMATICAS.md` (M1 cubre su C1 en lo que toca a piruetas).

## 0. Workflow (obligatorio)

1. **Una fase por vez, en orden.** Gate de cada fase: `npm run check` verde + el fixture
   `npm run maniobras` (desde M0) verde + **`npm run feel` idéntico al baseline** (anotarlo
   en §6 antes de M0 — el motor de piruetas toca al avión: la vara es sagrada).
2. Divergencias a §6. Defaults sin inventar: los que dé el diseño de cada maniobra.
3. Placeholders SIEMPRE (rotaciones exactas de 90°/180°, achique por altura): el arte
   horneado es del carril de producción y no bloquea ninguna fase.
4. No tocar modos ni specs ajenos salvo los enganches explícitos.

## 1. LOS CIMIENTOS *(la obra que paga por todas)*

| fase | entrega | criterio de cierre |
|---|---|---|
| **M0 · La vara y las sondas** | Fixture **`npm run maniobras`**: recorre el catálogo EXISTENTE completo disparando cada pirueta por sonda (`__mv('<id>')` — localizarla o crearla, marcada QUITAR) y verifica por cada una: dispara, dura lo declarado (`dur`), respeta `steer/fire/turbo`, y el avión sale en estado sano (velocidad, altura, sin NaN). Captura por pirueta opcional (`MV_SHOTS=<dir>`) | las 12 existentes pasan; `feel` idéntico; la red de regresión de maniobras existe ANTES de agregar nada |
| **M1 · PIRUETAS DE ACTOR** *(la infraestructura del programa — cubre el punto de C1 del director)* | Hoy `systems/moves.js` escribe SOLO al jugador (`plane`/`run`). Generalizarlo con el mínimo cambio: las cinemáticas operan sobre un **CUERPO** (`{x, y, z, bank, pitch, spd…}`) y el jugador es un cuerpo más — **cero cambio de comportamiento para el jugador** (M0 lo demuestra). Encima: `systems/wingmv.js` — un Fiel APARECE desde un costado o desde atrás (spawn con trayectoria de entrada, como el relevo/persec ya vuelan aviones amigos), ejecuta UNA maniobra del catálogo con su sprite y sale de plano. Sonda `__mvactor('<id>', 'izq'\|'der'\|'atras')` | `__mvactor('barrel','izq')` mete un Fiel haciendo el TONEL BARRIL en escena durante el vuelo normal, en cualquier modo, sin tocar el control ni la física del jugador; `feel` idéntico; fixture ampliado (las 12, como actor) |
| **M2 · LA CABINA como presentación** | `__mvcabina('<id>')`: dispara el poder del jugador con **cámara de cabina temporal** — el overlay de `drawCockpit` + el mundo contando la maniobra (el rolido del horizonte ya existe en `core/horizon.js`; sumar el cabeceo de la vista y el sacudón de G sobre los MISMOS beats). Al terminar la maniobra vuelve a la vista normal. También como perilla: `MV_CABINA` en OPCIONES = toda pirueta se vive desde adentro | el TONEL en cabina = el horizonte da la vuelta completa; el SPLIT-S en cabina = el mundo se invierte y pica; capturas de 3 piruetas × 2 vistas; fixture ampliado (las 12, en cabina) |

**Entrega temprana real:** al cerrar M2, TODO el catálogo actual es probable en las tres
presentaciones con tres sondas, sin haber agregado una maniobra. Si el modo PRUEBAS existe,
sumar el momento "PIRUETAS ×3 vistas" a su catálogo (`data/pruebas.js`) — es una llamada.

## 2. LAS MANIOBRAS NUEVAS *(una por fase; diseño exprés si el plan no existe)*

Regla de cada fase: si `PLAN_PIRUETA_<X>.md` ya existe (sesión de diseño corrida), se
implementa ese plan; si NO existe, la fase arranca con un **diseño exprés** (media página
siguiendo el modelo de la VOLTERETA + la ficha de PROMPTS_MANIOBRAS §2) que se guarda como
el plan, y recién después se implementa. Toda maniobra nueva entra al fixture y a las tres
sondas en la misma fase.

| fase | maniobra | destino y notas | criterio de cierre |
|---|---|---|---|
| **M3** | **LA VOLTERETA** *(el caso piloto — su plan está completo)* | poder (combo `⟳↑ ↓↑` a validar) + actor + cabina; V0–V3 de su plan + gancho `CAZA_MV_FUERZA` con ventana ×1.5 | las 3 presentaciones andando + el sobrepaso forzado medible en `npm run caza`; fila en el fixture |
| **M4** | **IMMELMANN** | poder + actor + cabina; el re-encare hacia arriba; contra LA COLA | ídem M3 (sin la ventana ×1.5, salvo que su diseño la pida) |
| **M5** | **EL RULO** (power loop) | poder caro + actor + cabina; candidato a cinemática de premio del PULSO (anotar el enganche, no implementarlo si el director no está) | las 3 presentaciones + fila en fixture |
| **M6** | **EL BATIR DE ALAS** (dedication pass) | SIN poder de combate: es la escena de m8 — actores (M1: varios Fieles en pasada baja con batido) + la variante casi-cinemática (el jugador saluda con Q/E) + cabina (ver el batido desde adentro) | la escena corre por sonda `__mvbatir()`; si el director (C0) existe, va como timeline; si no, guionada en `wingmv` y migrable |
| **M7** | **LA CAÍDA** (tail slide / campana) | cinemática pura, `control: 'solo_mirar'` — la pérdida de sustentación (el planeo del Final B, el flameout). Presentaciones: actor (verla de afuera) + cabina (vivirla); sin poder | `__mvcaida()` en las dos vistas; el flameout de la nafta la usa si LA CHANCHA/combustible están activos |
| **M8** | **EL VIFF del Harrier** *(enemigo — exceptuado de las 3 presentaciones)* | la contra del Harrier en LA COLA: cuando ganás la ventana, "se sienta" y te pasás de largo | `npm run caza` ampliado: la ventana tiene precio; el VIFF se ve y se lee |
| **M9** | **LA BARRENA** (flat spin) *(muerte — exceptuada)* | receta de `despiece`: el derribo girando plano antes de romperse + la huida del Harrier ahuyentado | `npm run romper` ampliado con la receta; comparada contra el TIRABUZÓN (no duplicar) |
| **M10** | **HOOVER / PEDAL** *(condicional)* | SOLO si sus sesiones de diseño concluyen que aportan algo que M3–M8 no cubren; si no, nota de absorción y fase vacía | decisión documentada |

## 3. Qué NO hacer

1. **No reescribir `moves.js`**: M1 es una generalización con el mínimo cambio (el patrón
   "cuerpo") — si el diff del motor es grande, está mal encarado. M0 es el testigo.
2. **El feel del jugador es intocable**: baseline en §6, verificado en TODAS las fases.
3. **Combos nuevos validados contra la gramática** (3–4 toques, dos manos, sin repetición
   vertical, sin prefijos) — el detector de M0 los prueba.
4. **Una maniobra por fase.** Nada de lotes: cada una cierra con sus tres sondas y su fila
   de fixture o no cierra.
5. **Ninguna maniobra gratis**: el precio (velocidad/altura/exposición) viene del diseño.
6. Sobriedad de siempre: vapor, G y horizonte; nada de festival.
7. Los actores de M1 no disparan ni colisionan con el jugador (son escena, no gameplay) —
   la versión con gameplay es otra decisión.

## 4. Relación con los otros planes

- **M1 cumple el punto "piruetas de actor" de PLAN_DIRECTOR_CINEMATICAS C1** — anotarlo
  allá al cerrarlo. Cuando el director exista, `wingmv` se vuelve su verbo `actor`+`move`
  (migración, no reescritura).
- **M3/M8** tocan `systems/caza.js` (LA COLA): coordinar con cualquier sesión activa ahí.
- **M9** toca `data/despiece.js` (LA DESTRUCCIÓN, terminada): solo agrega receta.
- El **modo PRUEBAS** (si existe) suma los momentos de cada fase — una llamada por fila.

## 5. El fixture `npm run maniobras` *(la columna vertebral)*

Patrón de los fixtures del repo (Electron + sondas + capturas opcionales). Por maniobra ×
presentación: dispara → mide duración y estado de salida → 0 errores de consola → canvas
vivo. Al final: `feel` contra baseline. Crece una fila por fase; en M10 cubre TODO el
programa. Es, junto con el catálogo de PRUEBAS, la red de regresión de maniobras del juego.

## 6. Divergencias *(completar durante la implementación — primero el baseline de `npm run feel`)*

### El baseline de `npm run feel` *(22/8/2026, antes de M0)*

**33 asertos, todos verdes, `FEEL: OK`.** La vara es el conjunto entero, no un número suelto: el
motor de piruetas es dueño del avión mientras dura la maniobra, así que cualquier cosa que se le
agregue puede filtrarse al vuelo normal sin que nada falle — sólo cambiando cómo se siente.

**La huella**, y cómo se saca:

```bash
npm run feel 2>/dev/null | grep -E "✓|✗|FEEL:" | md5
```

→ **`486dd9da44e926b34461c93062ef8ce9`** (22/8/2026)

Se compara con un hash y no aserto por aserto porque lo que hay que defender es que **no cambió
nada**, y un hash contesta eso sin lugar a interpretación. Si cambia, la fase no cierra hasta saber
por qué; si el cambio es legítimo —otra sesión tocó el vuelo— se re-ancla acá, con fecha.

> **El primer intento de baseline estaba mal y duró diez minutos.** Se hasheó `npm run feel 2>&1`,
> que arrastra los avisos de node por stderr — y esos aparecen y desaparecen entre corridas. Dos
> corridas seguidas del MISMO código daban hashes distintos. Una vara que no es reproducible no es
> una vara: es una alarma que suena sola, y una alarma que suena sola se termina ignorando. Por eso
> el recorte a las líneas de aserto, que son las únicas que hablan del juego.

Bloques que cubre: gas y gravedad · el techo y el piso · turbo · roce · ARENA (cabeceo, alabeo,
viraje de combate, energía) · el especial del PASILLO.

### Divergencias de M0 *(la vara y las sondas)*

1. **El primer baseline no era reproducible.** Ver el recuadro de arriba. La lección general: una
   vara se valida corriéndola dos veces sobre el mismo código *antes* de creerle.
2. **`__mv` ya existía** (se usaba para medir la estela de punta de ala) y estaba a medias: lanzaba
   `startMove(id, 1)` sin `tgt`, así que ASCENSO y SOBRE EL RADAR salían con techo 0 — la maniobra
   que trepa convertida en una picada al mar. Ahora la sonda **repite la elección del dispatcher**
   (`RADAR_ALT` / `FLY_TOP`): lo que se prueba tiene que ser lo que se juega.
3. **Se agregaron tres sondas** (`__mvcat`, `__mvdbg`, `__mvreset`), todas marcadas QUITAR y todas
   en `systems/moves.js` —al lado del motor, como `__qdbg` está al lado del PULSO—. `__mvcat`
   devuelve el catálogo VIVO: el fixture compara lo que la maniobra hace contra lo que declara sin
   copiarse una tabla que se desincronizaría en silencio.
4. **La gramática se lee del dispatcher, no de una tabla.** El fixture parsea los `case '<toques>'`
   de `game.js`. Y la regla "ninguna repetición" resultó ser **de las teclas de VOLAR**: `LLL`/`RRR`
   (el TONEL) son un toque repetido y están bien — son del stick derecho, que es una tecla dedicada
   a rolar. El peligro que la regla evita es que las teclas de volar produzcan maniobras solas.
5. **Son 13, no 12.** El TONEL entra a la vara aunque no esté en `MOVES`: vive en el camino legado
   (`run.rollT`) y el plan lo cuenta entre las existentes. Se mide con su propio reloj.
6. **Tres bugs del fixture, no del juego, y los tres con el mismo síntoma.** «El reloj de la pirueta
   clavado en 0 y NO TERMINA» — porque al morir el avión, `flight.js` deja de correr y
   `movesSystem` no se llama más. Las causas, en el orden en que aparecieron:
   *(a)* **el fixture no apretaba el gas.** «W: gas — si soltás, el avión cae» está escrito en la
   barra de ayuda del propio juego; el avión se hundía y chocaba el mar a los cinco segundos.
   *(b)* obstáculos sembrados por delante. *(c)* **proyectiles ya en vuelo**: limpiar obstáculos no
   alcanzaba, un misil lanzado antes seguía viajando. Se agregó `__pasilloLimpio()` en
   `systems/spawn.js` —hermano mayor de `__seaclear`— que vacía también balas y misiles.
   **La lección**: un síntoma que no se parece a su causa es lo que hace cara una investigación.
   Ahora la foto trae `S.state`, así que un fixture rojo por muerte lo dice con esas palabras.
7. **El fixture espera precondiciones, no tiempos.** El reset se pide hasta que el avión ESTÁ
   limpio, en vez de dormir "lo que suele alcanzar". Un fixture que duerme es una moneda.

### Divergencias de M1 *(las piruetas de actor)*

8. **La generalización son DOS LÍNEAS.** `cuerpoDe(act)` y `estadoDe(act)`, más un parámetro
   opcional en `startMove`/`movesSystem`. El resto del motor no se tocó: es el mismo texto con
   `plane.` → `B.` y `run.mv*` → `E.`. El §3.1 pedía el mínimo cambio y esto es literalmente eso —
   no otro motor, **el mismo motor apuntando a otro lado**. `feel` idéntico al baseline lo
   confirma, y las 13 filas de M0 lo confirman de nuevo.
9. **Tres cosas siguen siendo DEL JUGADOR, a propósito**, y cada una tiene su razón escrita al lado:
   · el gate `cfg.moves` (es la perilla de SUS poderes: el banco del Pichón, las opciones);
   · el rótulo con el nombre + el golpe de sonido (dicen "vos hiciste esto" — un actor los apaga con
   `mudo`, o la pantalla se llenaría de carteles anunciando piruetas ajenas);
   · `mvAllowsFire`/`mvAllowsTurbo`, que contestan "¿el jugador puede disparar?" — un actor no
   dispara (regla §3.7) así que no tiene a quién contestarle.
10. **Los topes del carril también.** `FLY_X`/`FLY_TOP` **significan** "hasta acá llega la zona
    jugable". Un actor nace FUERA de ese carril (esa es toda la gracia de que entre de costado), así
    que aplicárselos lo teletransportaba al borde en su primer cuadro. Se guardan con `B === plane`,
    que además es la forma más corta de decir qué son.
11. **Las profundidades del actor son perillas propias y absolutas**, no "las del jugador más
    cinco": `systems/` no puede importar de `render/` (donde vive `PZ`) — lo vigila
    `npm run lint:layers`, que atajó ésta y una segunda violación en el mismo commit.
12. **El render recibe la foto por parámetro** (`state()`), no importa el sistema: convención 4.
    `render/wingmv.js` no reusa `drawPlane` y el porqué está escrito arriba del archivo — ese dibuja
    EL avión del jugador con su bob, su cono transónico, su rociada y su tren. El precedente del
    repo es `render/squad.js`, que dibuja la formación con las mismas cuatro líneas de hoja.
13. **Un actor tiene escrito cómo se termina.** Tres puertas: el reloj de salida, salirse del cuadro
    y un **tope duro de vida** (`WINGMV.VIDA`). Es la misma lección que dejó el director de
    cinemáticas quedándose pintando blanco para siempre: algo que entra a escena y no sabe irse se
    queda, y el caso raro llega solo.
14. **El actor sale por el lado CONTRARIO al que entró.** Primer intento: se lo empujaba de vuelta a
    su borde y la figura frenaba en el medio del cuadro justo cuando tenía que irse. Entra por
    izquierda, vuela la figura, cruza y se va por derecha.


### Divergencias del MENÚ MANIOBRAS *(pedido del 22/8, entre M1 y M2)*

15. **Es la tercera puerta hermana**, con la misma mecánica que PRUEBAS y CINEMÁTICAS y el mismo
    renderer de filas. Lo único propio es que tiene **dos niveles**: primero la pirueta, y adentro
    sus tres presentaciones. Dos niveles y no un toggle porque son dos preguntas distintas — "qué
    maniobra" y "cómo la quiero ver"— y mezclarlas obligaba a leer el modo en un renglón que ya
    decía otra cosa.
16. **El catálogo se deriva de `MOVES`** (`maniobras()` en `data/moves.js`), igual que el de
    CINEMÁTICAS se deriva de las timelines: una pirueta nueva aparece sola. Las tres variantes son
    `MV_VISTAS`, y cada una es **una llamada a los verbos de `pruebasApi()`** — exactamente el
    patrón de `data/pruebas.js`: data describiendo llamadas a la capa de sondas, sin lógica de
    juego. Los combos escritos ahí son un **rótulo**: la verdad es el dispatcher, y quien la
    verifica es `npm run maniobras`.
17. **La tercera presentación llegó antes que M2, y no es M2.** "Como cinemática" es la maniobra
    corrida por **EL DIRECTOR** sobre el vuelo normal (bandas negras + mundo en cámara lenta), con
    una timeline genérica —`maniobra` en `data/cines.js`, sin `titulo` para que no aparezca en el
    menú CINEMÁTICAS— cuya pirueta llega por ligadura. **La CABINA de M2 sigue pendiente**: son dos
    cosas distintas y ésta no la reemplaza.
18. **El director tuvo que aprender a correr en el PASILLO.** Hasta ahora sólo vivía adentro del
    PULSO (que lo actualiza él mismo). Dos cambios chicos, y los dos con una razón:
    · `movesSystem` sólo se llama desde el director **si la cama de vuelo está prendida** (`vuelo`).
    En el PULSO el dueño del avión es el director; en el PASILLO es `flight.js`, que ya la llama —
    sin la guarda, la maniobra avanzaba **dos veces por cuadro** y duraba la mitad.
    · el `tempo` del director se aplica **después** de capturar `dtReal`.
19. **`run.dtReal` no es el reloj de pared**, y el nombre miente lo suficiente como para costar una
    hora. Es *el dt antes de los reescalados de escena*: se captura al entrar a `update()`, después
    del `tempo` global pero antes del reescalado del PULSO. Al aplicar la cámara lenta del director
    en el cálculo del dt del cuadro, **la escena se dilataba a sí misma**: los dos relojes se
    estiraban juntos, nada cambiaba en relativo, y las bandas se levantaban a destiempo. El síntoma
    ("la maniobra dura lo que debe pero el letterbox no la acompaña") no se parecía a la causa.
    Movido a después de `dtReal`, el reloj de la timeline vuelve a ser de pared **en los dos modos**,
    que es lo que el contrato de `systems/cine.js` dice desde el primer día.
20. **Una sola perilla para la cámara lenta y la conversión de relojes** (`MV_FILM.LENTO`): es a la
    vez el `tempo` que pide la escena y el divisor con que la duración de catálogo se convierte a
    segundos de pared. Escritos por separado, las bandas se destiempan en cuanto alguien toca uno.
