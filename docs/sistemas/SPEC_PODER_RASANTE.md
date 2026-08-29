# SPEC — el poder «RASANTE» (tecla 6): el juego activando su propio nombre

> **Estado: implementado (RA0-RA4, 23/8). Queda RA2b — el cabeceo de cámara, ver §8.** El cuarto poder del
> PASILLO, cerrando los cuatro ejes: turbo = velocidad · MOMENTUM = tiempo · CHANCHA =
> nafta · **RASANTE = altura**. Referencia de sensación:
> [Rasant GamePlay](https://youtu.be/Fe31krHWwjE?t=54) — cámara a la altura de la cubierta,
> el agua llenando el cuadro, la velocidad contada por el parallax cercano. **La identidad
> NO se copia de ahí**: se carga con lo propio (el silencio, la radio, el reflejo, la
> lección del sapito) — decisión explícita de la charla de diseño.
>
> **La idea en una frase:** activás RASANTE y por unos segundos el avión QUIERE estar al
> ras — el default vertical se invierte (el resorte al piso), el mundo enmudece, la cámara
> baja, y vos solo esquivás y disfrutás la banda del ×10 que el resto del juego te hace
> sudar. La tesis del juego ("los valientes vuelan abajo") hecha poder, con el nombre del
> juego.
>
> Leer antes: `docs/ARQUITECTURA.md` (manda; divergencias al §8) · `SPEC_PODER_CHANCHA.md`
> (el patrón de poder hermano ya implementado) · `systems/tempo.js` (el patrón
> barra/duración) · trampas del repo en `SPEC_AGUA_OLAS.md` §1.

## 1. Requerimientos

### RF-01 · El resorte al ras (el default invertido — el corazón del poder)
Con RASANTE activo, la dinámica vertical se INVIERTE: sin input, el avión desciende suave
y se ASIENTA en `RAS_ALT` (el reposo es la gloria, no la caída). Mantener ↑ sube con la
fuerza normal hasta el techo blando `RAS_CEIL`; soltar devuelve al ras con el resorte
(`RAS_SPRING`). Izquierda/derecha, turbo, armas y piruetas: intactos. **CA:** soltar ↑
desde el techo asienta en `RAS_ALT` en ~1 s sin rebote feo; mantener ↑ jamás cruza
`RAS_CEIL`; el lateral se siente idéntico al PASILLO de siempre (mismos números).

### RF-02 · El colchón (perdón sin invulnerabilidad)
Durante el poder, el agua PLANA no castiga: `run.scrapeT` no crece y el roce no mata — el
resorte además no deja tocarla salvo empujón externo. **Lo que sigue matando igual:** la
CARA de una ola, todo obstáculo y todo fuego enemigo. El poder quita el castigo por
micro-error de altura, no el peligro. **CA:** fixture — agua plana 12 s sin daño; cara de
marejada durante el poder = `death_sea` como siempre.

### RF-03 · La carga: volar bajo te gana volar bajo
La barra se llena con **segundos en la banda del ×10 volados A MANO** (alt ≤ 4.5 sin el
poder activo): `RAS_CHARGE_S` de banda = barra llena. No carga con puntos ni con tiempo de
pared. Tecla **6** la lanza llena; dura `RAS_DUR`; al cortar, barra a cero. **CA:** volar
alto no carga nada; la sonda mide banda acumulada vs barra.

### RF-04 · La cámara — dos prototipos, se elige a feel
Quinta cámara SOLO durante el poder, detrás de la perilla `RAS_CAM`:
`'cola'` = la chase de siempre caída justo bajo la cola (avión siluetado contra el cielo,
el agua corriendo cerca por debajo, leve zoom out para no perder lectura) ·
`'cabina'` = la 1ª persona con el horizonte alto (la vista del piloto al ras — la que el
video de referencia no tiene). Al terminar el poder, la cámara vuelve con una transición
corta, sin corte seco. **CA:** ambas se prueban con la sonda; **la elección final es un
checkpoint con Matías** (RA2) — no la decide la sesión.

### RF-05 · El teatro: el silencio, la radio, el reflejo, la lección
- **El silencio**: al activar, el mundo se APAGA (ducking fuerte de música y capas) — queda
  el motor, el agua y opcionalmente el latido. Todos los boost-modes gritan; este susurra.
  Al terminar, el sonido vuelve como una exhalación.
- **La radio**: una línea al activar, rotando (`rasante_call_*`): la regla de Puma
  ("Pegado al agua el radar de ellos no te ve"), el grito del numeral ("¡Abajo,
  {indicativo}, abajo!"). Strings es/en.
- **El reflejo**: si E0.2 (reflejo del avión) existe, durante el poder avión y reflejo
  casi se tocan — es EL indicador. Si no existe aún, no bloquea (se anota).
- **La lección**: la PRIMERA activación de cada perfil muestra la línea del sapito
  ("La piedra no se hunde si va rápido y pegada al agua") — una vez, nunca más.
**CA:** mirada ciega — se sabe que el poder está activo solo por el audio.

### RF-06 · Convivencia
Turbo + RASANTE: **sí** (el combo soñado). MOMENTUM + RASANTE: **sí**. CHANCHA: **no** —
la canasta está arriba; llamarla (5) corta RASANTE, y con RASANTE activo el 5 avisa y no
llama. LA COLA (Harrier): sin código nuevo — volar al ras YA degrada su solución (sinergia
natural). Solo fase PASILLO (jamás en clímax); en PERSECUCIÓN nace **apagado** (la altura
la manda el líder — decisión revisable anotada). **CA:** fixture de cada combinación.

### RF-07 · Puntaje y récords
Sin bonus propio: el ×10 lo da la altura, como siempre. La economía la cierra la carga
(RF-03: el poder es skill previa convertida en ráfaga, no multiplicador gratis). **CA:**
`npm run feel` idéntico con el poder OFF; una corrida con poder no supera a una corrida
igual de hábil sin él por más del ratio esperable (medido en fixture, informativo).

## 2. Perillas *(en `data/tuning.js`, bloque «EL PODER RASANTE», valores finales)*

`RAS_ALT 3.0` (el reposo del resorte) · `RAS_SPRING 6` (rate del lerp de vuelta) ·
`RAS_CEIL 17` (techo blando: apenas bajo `RADAR_ALT` 20, mismo filo que el techo del
banco) · `RAS_DUR 12` s · `RAS_CHARGE_S 25` s de banda a mano · `RAS_CAM 'cola'` ·
`RAS_LATIDO true` · árbol de mejoras futuro = `RAS_DUR`/`RAS_CHARGE_S`, igual que el
MOMENTUM.

## 3. Módulos

| archivo | rol |
|---|---|
| `systems/rasante.js` | NUEVO — dueño del poder: barra, activación, reloj, señales de fase. Patrón de `tempo.js`/`chancha.js`. No llama hacia arriba |
| `systems/flight.js` | consulta `rasante.active()` para la rama vertical (resorte en vez de gravedad) y el perdón del roce — mismo patrón que ya usa con la CHANCHA (`chAvance`) |
| `game.js` | tecla 6 (siguiendo 4/5), tick del poder, cámara del poder en el bloque de cámara |
| `render/hud.js` | la barra (al lado de la del MOMENTUM, mismo lenguaje visual) |
| `systems/audio.js` | el ducking del silencio + la exhalación de salida |
| `data/strings.js` | `rasante_call_*`, la lección, textos HUD — es/en |

## 4. Sondas y fixture

`?rasante` (barra llena al arrancar) · `__rsdbg()` (barra, activo, reloj, altura,
scrapeT congelado, cámara) · `__rscharge()` (llena la barra) — marcadas QUITAR.
**`tools/fixture_rasante.js` + script `rasante`**: carga solo por banda · tecla 6 ·
resorte asienta en ~1 s · techo no se cruza · colchón (agua plana no mata, `scrapeT`
quieto) · cara de ola mata igual · dura `RAS_DUR` exactos · CHANCHA bloqueada durante ·
turbo/MOMENTUM conviven · **`npm run feel` idéntico con poder OFF** · cero errores.

## 5. Fases

| fase | entrega | criterio de cierre |
|---|---|---|
| **RA0** | Datos + perillas + strings + `systems/rasante.js` esqueleto (barra que carga por banda, tecla 6, reloj) + sondas + fixture base | la barra carga volando bajo y no volando alto; `check` verde |
| **RA1** | El resorte (RF-01) + el colchón (RF-02) en `flight.js`, HUD de barra mínimo | fixture completo de vuelo; `feel` idéntico con poder OFF; **jugarlo**: el resorte se siente resorte, no riel |
| **RA2** ✅ | Las DOS cámaras (RF-04) detrás de la perilla + transición de entrada/salida | capturas de ambas + **checkpoint con Matías: elegir una** (o dejar la perilla) |
| **RA2b** 🟥 | **EL CABECEO DE CÁMARA** — mover `HOR` durante el poder para que la cámara pueda MIRAR HACIA ABAJO. Es lo único que falta para el encuadre de la referencia (ver §8) y **no es una perilla del poder: toca `proj()`**, o sea la proyección de todo el juego | el avión abajo-izquierda **y** el agua cercana grande al mismo tiempo; mar, terreno, HUD, hitboxes y horizonte giratorio verificados; `feel` idéntico |
| **RA3** ✅ | El teatro (RF-05): silencio/ducking + exhalación, radio rotativa, latido, la lección de primera vez; reflejo si E0.2 existe | mirada ciega pasa; la primera activación muestra la lección UNA vez |
| **RA4** ✅ | Convivencia (RF-06) + puntaje (RF-07) + docs (ARQUITECTURA fila del poder, COMO_PROBAR fila nueva, este spec a estado implementado) + `npm run rasante` completo en verde | todas las combinaciones probadas; gates totales |

## 6. Qué NO hacer

1. **No autopiloto**: el resorte invierte el default, no quita el control — ↑ siempre
   responde. Si en el playtest se siente "riel", se ablanda `RAS_SPRING`, no se agrega
   asistencia.
2. **No invulnerabilidad** (RF-02): olas de cara, obstáculos y fuego matan igual.
3. **No ruido**: el poder susurra (RF-05). Nada de whoosh de boost genérico.
4. **No tocar los números del vuelo con el poder OFF** — `npm run feel` es el juez.
5. **No más de `RAS_DUR` 12 s** sin decisión del director: la adrenalina es ráfaga.
6. No aparece en clímax (ARENA/PASADA/PULSO) ni carga ahí.

## 7. La identidad *(por qué esto no es el video de referencia — para la posteridad)*

La cámara baja es gramática de cine, no identidad. Lo que hace RASANTE inconfundible:
**el silencio** (el único boost que baja el volumen) · **la radio del escuadrón** (la
doctrina gritada) · **el reflejo que casi te toca** (información de altura como imagen) ·
**la lección del sapito** (el prólogo hecho poder) · **la carga por skill** (volás bajo a
mano para ganarte volar bajo glorioso). Cualquiera de las cinco falta → se agrega antes
que cualquier adorno.

## 8. Divergencias *(completar durante la implementación — con el baseline de `npm run feel`)*

### El baseline de `feel` — y cómo se compara sin romperle el árbol a nadie

**`npm run feel` da IDÉNTICO línea por línea con el poder apagado**, en RA0 y en RA1. Se compara
contra un **worktree aparte** en HEAD (`git worktree add --detach`), no con `git stash`: el árbol
de trabajo de este repo tiene sesiones concurrentes encima y stashear para medir es guardarle el
trabajo a otro. Se hizo una vez —volvió intacto— y no se repite; queda anotado como método.

Las 60 líneas del reporte coinciden exactamente. Es el juez del §6.4 y pasa: el resorte y el
colchón **solo existen** dentro de `if (rasante.active())`, y con el poder apagado el código que
corre es byte por byte el de antes.

### RA0

1. **La barra NO se guarda: se DERIVA de los segundos de banda.** Estuvo guardada aparte media
   hora y se desincronizó en el primer fixture: cortar a mano ponía la barra en cero **sin tocar
   los segundos**, y el `tick` de ese mismo cuadro la volvía a llenar con los segundos viejos —
   **poder infinito**. Con `meterVal()` derivado de `banda`, ese error ya no se puede escribir. La
   línea del fixture que lo agarró se quedó, con el comentario de por qué existe.

2. **La banda del ×10 la resuelve el ORQUESTADOR, no el módulo.** `rasante.tick()` recibe
   `enBanda` ya calculado por `game.js` (`plane.y <= 4.5`), que es el mismo número que mide
   `flight.js`. Si el módulo lo recalculara habría dos verdades el día que la banda se mueva.

3. **`cargar()` es pública y no sólo una sonda.** La usa `?rasante` (que es código de juego, no de
   prueba) además de `__rscharge`. Marcada QUITAR igual que el resto.

### RA1

4. **El resorte es de PRIMER orden, no de segundo.** El spec dice "resorte" y un resorte de
   verdad —fuerza proporcional al error— **oscila**: el avión pasaría de largo el ras y rebotaría.
   El criterio de cierre pide *"sin rebote feo"*, así que lo que se implementó es un perseguidor de
   velocidad: la vertical **deseada** es proporcional al error de altura y la real persigue a esa
   deseada. No puede pasarse de largo. Medido: asienta en **0,92 s** desde el techo y después
   oscila 1,0 m alrededor del ras.

5. **El techo es blando POR ARRIBA de un tope duro.** El empuje se apaga en los últimos 3 m antes
   de `RAS_CEIL` (eso es lo que lo hace sentir "quedarse sin aire" y no "chocar un vidrio"), y
   además hay un clamp que garantiza el CA. Medido: manteniendo gas 4 s, máximo **17,0 m** con
   `RAS_CEIL 17`.

6. **El colchón es del AGUA y sólo del agua.** El spec dice "el agua plana" y no menciona la
   tierra; ampliarlo por simetría sería inventar alcance. Sobre tierra el roce es el de siempre.
   **Revisable** — si en el playtest volar rasante sobre la turba con el poder puesto se siente
   incoherente, la condición es una sola palabra en `flight.js`.

7. **Rozar la CRESTA de una ola sigue costando margen.** El colchón vive en `flight.js` (el agua
   plana) y `systems/collision.js` no se toca, así que la cara mata y la cresta cobra, igual que
   siempre. Es coherente con §6.2 —el poder perdona el micro-error de altura, no clipear olas— y
   es lo que hace que la contra-prueba del fixture (§7 del fixture) signifique algo.

8. **El HUD lee el poder por SNAPSHOT, no por import.** `render/hud.js` importa `tempo` y
   `chancha` directamente, pero esas dos violaciones están en el trinquete de `lint:layers`, que
   **sólo puede achicarse**: agregar la tercera puso el gate en rojo. Se pasa por el snapshot de
   `drawHUD`, que además es la convención 4 de ARQUITECTURA — el dibujo lee lo que el orquestador
   le pasa. Los dos hermanos quedan como estaban; el nuevo entra bien.

### RA2 — el encuadre, y el límite del motor que apareció buscándolo

10. **El signo de la cámara era al revés, y me lo corrigió Matías.** Leí *"la chase de siempre
    CAÍDA justo bajo la cola"* como bajar la cámara respecto del avión, y el resultado es lo
    contrario de rasante: el avión queda clavado **sobre** la línea del horizonte con una franja
    fina de mar debajo. En esta proyección la superficie se dibuja desde el horizonte **hacia
    abajo**, así que cuanto **más alta** está la cámara más mar entra en cuadro y más abajo queda
    el avión. Elegido con un barrido de 2.6 / 4.5 / 6.5 / 9.0 sobre el mismo instante — mirando,
    no razonando.

11. **Faltaba un eje entero: el CORRIMIENTO LATERAL.** Las referencias que marcó Matías tienen la
    nave **abajo a la izquierda**, no centrada, y eso no es altura: es `cam.x`. Se agregó `lat` a
    la cámara del poder — positivo corre la cámara a la derecha y al avión a la izquierda.

12. **Y el zoom del sprite, que ayuda pero no resuelve.** `camScale` ya existía (lo usaba la salida
    del escuadrón) y escala **sólo el dibujo**: agranda el avión sin moverlo.

13. ⚠️ **EL LÍMITE: los dos ejes que pide la referencia se pelean, y es estructural.** En este
    juego **el horizonte está clavado** en una fila fija de pantalla (`HOR` en `render/ctx.js`) y
    la cámara no puede cabecear — sólo sube, baja y se corre. De ahí:

    | | agua del borde inferior | dónde queda el avión |
    |---|---|---|
    | cámara **baja** | agua **muy cercana**: detalle enorme (el "zoom" pedido) | **pegado al horizonte** |
    | cámara **alta** | agua lejana: se afina | **abajo a la izquierda** ✅ |

    La referencia consigue las dos cosas **porque esa cámara mira hacia abajo**: un cabeceo mueve
    el horizonte hacia arriba sin alejar el agua. Acá eso no existe, y ningún valor de `lift`,
    `lat` o `zoom` lo puede fabricar.

    **Decisión de Matías (23/8): se cierra RA2 con el compromiso** —`lift 3.0 · lat 10 · zoom 2.0`,
    con el avión a `RAS_ALT 2.4`— que es el cuadro que aprobó mirando, y **el cabeceo se abre como
    RA2b**, fase propia. El motivo de separarlo: mover `HOR` toca `proj()`, o sea la proyección de
    todo el juego (mar, terreno, HUD, hitboxes, horizonte giratorio) — no es un ajuste del poder.

14. **`RAS_ALT` bajó de 3.0 a 2.4, y no por gusto.** Matías pidió el avión "bien cerca del agua" y
    2.4 es la altura con la que se sacó la captura aprobada. El mar plano promedia 1.1 y pica en
    1.9, así que a 2.4 el avión pasa a ras de la cresta — que es exactamente lo que el COLCHÓN
    existe para perdonar. Las dos perillas se mueven juntas.

15. **La transición NO se programó, y es a propósito.** La cámara ya llega tarde (el lerp de 3.2 es
    el peso de toda la cama de vuelo), así que cambiarle el destino la hace **viajar sola**, de ida
    y de vuelta. Escribir una interpolación aparte habría sido una segunda cámara peleando con la
    primera. El criterio pide "sin corte seco" y esto es exactamente eso, gratis.

16. **El avión sigue mirando DE FRENTE.** En las referencias la nave está en 3/4 —se le ve el
    costado— porque esa cámara es 3D. Acá el sprite está horneado desde atrás, así que por más que
    la cámara se corra al costado el avión queda de espaldas. Arreglarlo es **PLAN_HORNEADO B6**
    (una fila de yaw para el avión del jugador); insinuarlo con las columnas de alabeo que ya
    existen es barato y aproximado. Ninguna de las dos es de esta fase.

17. **El checkpoint del RF-04 quedó SIN RESOLVER como elección.** Se lo comió el problema del
    encuadre, que resultó más grande que elegir entre dos cámaras: las dos entradas de `RAS_CAMS`
    comparten hoy el mismo encuadre y sólo difieren en si se dibuja el sprite. La elección
    `cola` vs `cabina` sigue abierta detrás de la perilla, y conviene rehacerla **después de
    RA2b** — con el cabeceo puesto, las dos se ven distintas de lo que se ven hoy.

### RA3 — el teatro

18. **La música NO se apaga del todo, y lo pidió Matías.** El spec dice "el mundo se APAGA (ducking
    fuerte)" y el §7 llama al silencio *"el único boost que baja el volumen"*. El pedido del 23/8
    agregó *"quizá alguna música de fondo de concentración"*, que lo contradice a medias. Se
    resolvió con **un hilo** (`RAS_MUS 0.07`, contra el 0.30 normal): sigue leyéndose como silencio
    —es cuatro veces más bajo que el MOMENTUM, que ya es el más ahogado del juego— pero no como un
    bug de audio, que es lo que pasaba con cero. La identidad del §7 se sostiene.

19. **El agua SUBE mientras todo lo demás baja** (`RAS_AGUA 1.9`). Es lo que hace que el silencio se
    lea como *"me acerqué al mar"* y no como una falla del sonido. Sin esto, apagar las capas deja
    un vacío que se siente roto.

20. **Las capas de ambiente se saltean ENTERAS, no se les baja el volumen una por una.** La
    tormenta, la batalla y el viento son el MUNDO, y el mundo es justo lo que el poder apaga. Se
    escribió como un `if (rasOn) { }` que se come el bloque, a propósito: así el día que se agregue
    una capa nueva no se olvida de callarse.

21. **El latido se ACELERA en los últimos tres segundos** (`RAS_LAT_T * 0.55`). No está en el spec.
    Es lo único del poder que avisa que se termina sin escribir un cartel — el cuerpo se entera
    antes que el ojo, que es exactamente el registro que pide el §7 ("susurra, no grita"). Vive en
    el módulo y no en el audio porque el módulo es el que lleva el reloj.

22. **El beep de entrada va GRAVE y hacia abajo** (`-90`), al revés de todos los demás poderes del
    juego, que suben. Es la versión en un sonido de lo que el §7 pide, y se nota antes de que el
    jugador entienda por qué.

23. **La radio rota POR USO, no al azar.** La primera vez que lo activás escuchás la regla (la de
    Puma) y recién después los gritos. Un sorteo podría darte tres veces la misma en la primera
    corrida, que es justo cuando cada línea todavía tiene algo que decir.

24. **La lección del sapito vive en `localStorage`.** El spec dice "la PRIMERA activación de cada
    perfil", así que tiene que sobrevivir a la partida — no alcanzaba con un flag del run.

### RA4 — convivencia y puntaje

25. **La CHANCHA se bloquea en LOS DOS SENTIDOS, y el spec sólo pedía uno.** El RF-06 dice que con
    RASANTE puesto el 5 avisa y no llama. Falta la mitad simétrica: con la Chancha **en el aire**,
    el 6 tampoco arranca — dejarlo abierto permitía lanzar el poder **a mitad de la cita** y tirar
    al avión al agua con la manguera enganchada. Es alcance que el spec no pide y que la mecánica
    sí. Ninguno de los dos **cobra barra** ni corta nada en silencio: la tecla contesta y listo, que
    es la disciplina de los gates de `chancha.pedir`.

26. **El poder corre con el dt del MUNDO, y eso es lo que lo compone con el MOMENTUM.** Lanzado en
    cámara lenta dura lo mismo **en tiempo de juego** — el mismo criterio que el ETA de la Chancha.
    Medido en el fixture: en cámara lenta se gasta menos de 0,6 s de poder por cada 0,7 s de pared.

27. **El RF-07 se verifica midiendo, no razonando.** "El poder no da puntos propios" se comprueba
    comparando el puntaje ganado **a la misma altura** con y sin el poder puesto: el ×10 lo da la
    altura, así que los dos números tienen que dar iguales. Sin esa medición, la afirmación sería
    una lectura del código y no un hecho.

9. **El gas es `W`, no la flecha ↑.** Las flechas son la MIRA. La primera versión de la prueba del
   techo mantenía ↑, el avión se quedaba quieto en el ras y el techo "no se cruzaba" **por la razón
   equivocada**: pasaba en falso. La prueba ahora exige además que HAYA SUBIDO — una prueba que
   puede pasar sin que ocurra lo que mide no prueba nada.
