# Prompt — ARENA DE VUELO LIBRE: la fase ARENA pasa a ser vuelo 3D de verdad

> **Vocabulario (27/7/2026):** el run se separó en dos FASES con nombre — **PASILLO** (el vuelo
> rasante de siempre) y **ARENA** (el asalto al buque, lo que describe este documento). Este
> prompt es anterior al bautismo y todavía dice "el clímax"; leelo como sinónimo de "la fase
> ARENA". Detalle completo del vocabulario en `docs/ARQUITECTURA.md`.
>
> **ESTADO: etapas A, B, C y D HECHAS** (26/7/2026). El avión vuela de verdad en los tres ejes,
> el mundo se mira desde cualquier rumbo, el cañón/misil pegan por rayo desde el morro, **el
> buque contraataca** (trazadoras + flak telegrafiado con predicción: radar vivo = te apuntan a
> donde vas a estar; el punto de detonación se fija al disparar y la distancia REAL en el mundo
> decide) y **las colisiones matan**: el mar (`death_sea`) y el casco (`death_mast`), consumiendo
> escuadrón como todo el juego. **Primera persona por defecto** (decisión del autor: la cabina ya
> es un asset terminado y esquiva el sprite en 3ª, que se veía tosco); la 3ª quedó en [V] con
> cámara con resorte. Verificado con harness: volar derecho con radar vivo = flak encima (vidas
> 4→3), relevo re-entra con el daño persistido, picar sin gas = mar (3→2), escuadrón agotado =
> derribado. Gate completo en verde. **Faltan E y F** (legibilidad fina, audio propio, docs
> finales) y el pase de tuning de sensación con el juego en la mano.
>
> **MINUTOS SAGRADOS** (27/7): el asalto es un **modo de juego propio**, cuarto en el selector.
> Entra derecho a la batalla (sin camino), el `[M]` trae una fila **BUQUE** para elegir cuál de
> los seis atacar — es lo que permite probar los tres layouts — y al terminar **encadena otra
> batalla al azar**. Los cuatro modos quedan bien separados: HISTORIA (el nivel completo),
> CICLO DE MUERTE (niveles completos al azar), POR LA PATRIA (solo el camino, infinito) y
> MINUTOS SAGRADOS (solo la batalla). El fin de batalla caía en el `else` del epílogo y se iba
> al briefing del ciclo — o sea, a volar una misión entera de otro modo.
>
> **El vuelo pasó a ser EL DEL PASILLO (27/7)**, porque el modelo anterior se sentía tosco. La
> causa era estructural: el input pasaba por mira → tasa de guiñada → rumbo → posición (TRES
> integraciones de retardo), mientras el pasillo va input → velocidad (UNA). Ahora `arena.js` usa
> las **mismas constantes** de `flight.js` (lateral 115/4.5/±30, gas `G/TH/DIVE`, clamps de vy) y
> los **mismos tiempos visuales** (bank `dt*9`, `pitchTarget`+`PITCH_LERP` de `core/physics.js`).
> Lo único que se agrega sobre el pasillo es que **el rumbo lo arrastra la propia velocidad
> lateral** (viraje coordinado), para poder rodear el buque sin un control nuevo. Medido: vx
> 0→30 en ~0.27 s y decae a 1.8 en 0.6 s al soltar — idéntico al pasillo. También entraron
> **turbo ×1.5** y la **mira elegible del menú [M]**, que faltaban.
> En 3ª persona el avión ahora se dibuja **proyectando su posición real** en vez de clavado a un
> punto fijo: al maniobrar se desplaza dentro del cuadro y la cámara lo recentra después.
> En 1ª persona el PNG de cabina baja `COCKPIT_Y = 74` px para que el **visor pintado coincida con
> la mira** (que cae donde apunta el morro, no en un punto fijo como en el ARENA VIEJO).
>
> Bug encontrado al hacerlo: el arena **drenaba combustible aunque `[M] COMBUSTIBLE: NO`** (el
> default), así que en una batalla larga te quedabas sin gas y caías al mar sin explicación. Ahora
> respeta la llave, igual que el pasillo.
>
> Bug con moraleja de esta etapa: el aviso de flak nacía **sin `life`** y el filtro genérico de
> fx (`life > 0`) lo mataba en el mismo frame — el buque "no disparaba" sin ningún error. Quedó
> comentado en el código: todo fx nuevo necesita `life` mayor que su fusible.
>
> Hallazgos de la implementación, ya corregidos y anotados en el código:
> - el **domo tiene que ir centrado en el avión, altura incluida**: dejarlo en `y=0` mientras
>   volás alto baja su ecuador respecto del horizonte real del mar y aparece una banda de
>   "suelo" cruzando la pantalla;
> - el **plano del mar va hundido** bajo el nivel del agua, si no tapa la mitad de la alfombra
>   de puntos (los senos de la ola) y el mar se ve liso;
> - la **niebla tiene que empezar más lejos que el ring** (900 m para un ring de 700), o se come
>   el combate entero y todo queda del color del horizonte;
> - **techo de 200 m**: desde 300 m el buque (125 m) se sale del campo de visión volando derecho;
> - el **cabeceo va por ángulo objetivo, no por tasa**: con tasa, sostener el gas clavaba el
>   avión en el techo a los pocos segundos.

> Reemplaza a [PROMPT_MOMENTUM_3D.md](PROMPT_MOMENTUM_3D.md), cuya implementación se probó y **se
> rechazó**: ahí el avión no vuela — **gira el buque** y la cámara está clavada mirando a `-z`.
> Es la misma galería de tiro con otro disfraz. Este documento es el rediseño.

El clímax del nivel (el asalto al buque) tiene que ser un **combate aéreo en un espacio 3D
abierto y acotado**: el avión vuela **en los tres ejes**, con cámara libre en primera o tercera
persona, ataca las partes del buque y esquiva su fuego. Al llegar al borde del ring el juego
**deja salir** al avión pero **toma el control** y lo redirige al centro.

Antes de tocar código leé `docs/ARQUITECTURA.md` (las cuatro convenciones y el vocabulario
PASILLO/ARENA), `src/systems/three-arena.js` (el mundo 3D de la fase ARENA, ya separado de
`three-world.js`) y `src/systems/arena.js`.

---

## 1. Lo que se tira y por qué (esto no es opinable)

La escena 3D actual está construida sobre **una cámara que mira siempre a `-z` y solo se traslada
en x**. Tres piezas dependen de eso y **ninguna sobrevive a una cámara libre**:

| pieza | cómo está hoy | qué pasa al girar la cámara |
|---|---|---|
| **Cielo** | un **plano** de 13500×3400 en `z = -2450` (`three-world.js:71`) | girás 90° y el cielo **no está**: se ve el vacío |
| **Sol** | otro plano, a `z = -2350`, con parallax de `cam.x` | queda pegado a una dirección; no es un astro |
| **Mar** | parche construido **por frame en filas de profundidad** (`camZ2 = 5..375`), cada fila más ancha con la distancia — **la forma del frustum** de una cámara que mira al frente | al mirar a un costado el mar es una lengua angosta rodeada de nada |
| **Cámara** | `setViewOffset` para clavar el punto principal en `(W/2, HOR)` y calzar con `proj()` del 2D | esa equivalencia 2D↔3D **ya no hace falta** y es la que ata todo |
| **Truco del arena** | el **buque rota** (`ship.rotation.y`) simulando órbita | es exactamente el problema que hay que borrar |

**Lo que SÍ se conserva:** el buque de cajas por clase con sus **zonas etiquetadas**
(`userData.zone`), el raycast, el chamuscado, `MOM_LAYOUTS` como data, la integración con el
escuadrón, la señal de salida (`'objective'` / `{death}`) y el overlay 2D de corchetes/HP.

---

## 2. Qué hay que construir

### 2.1 Un mundo 3D que se pueda mirar desde cualquier lado

- **Domo de cielo** (esfera invertida o cubo) con el mismo degradé de la paleta vigente
  (`theme.sky`) — reemplaza al plano. El sol es un objeto **en el domo**, no un plano frente a la
  cámara.
- **Mar como superficie real**, una malla cuadrada **centrada en el avión** (no en el frustum),
  que se re-centra por frame y desplaza sus vértices con `seaH()` — la misma función que ya usa
  el mar 2D, así el oleaje es el mismo. La **alfombra de puntos** (el look del juego) se genera
  igual pero en una **grilla cuadrada alrededor del avión**, no por filas de profundidad.
- **Niebla** para cerrar el horizonte (ya existe, `Fog`), con el color del horizonte de la paleta.

### 2.2 El avión vuela (el corazón del pedido)

Un objeto 3D con **posición, orientación y velocidad**. La física conserva el espíritu del vuelo
rasante del juego base:

- **Avanza solo, siempre hacia donde apunta el morro.** No hay "adelante" del mundo: hay adelante
  del avión.
- **Gas contra gravedad**: mantener ↑/W empuja; soltar y la gravedad gana. Es la regla que define
  el juego base (`flight.js:125`: `G = 22, TH = 55, DIVE = 30`) y acá se conserva.
- **Izquierda/derecha viran** (alabeo + guiñada coordinados), no desplazan de costado.
- **La MIRA dirige**: el morro persigue el punto apuntado. Es literalmente lo pedido — "avanzará
  en todas direcciones según la mira del avión". Con mouse la mira es libre; con teclado/pad las
  direcciones la mueven.

### 2.3 El ring y el auto-retorno

- Volumen acotado alrededor del buque (esfera o cilindro).
- Al cruzar el borde: **aviso** (rumbo + cuenta) y a los ~1.5 s el juego **toma el control**:
  vira solo hacia el centro, con el HUD diciendo que está en piloto automático, y devuelve el
  control al reencarar. **No es un muro invisible ni una muerte**: es una correa.
- Mientras estás fuera del ring **no podés disparar** (si no, se convierte en francotirador lejano).

### 2.4 Cámara

- **3ª persona**: detrás y arriba, con retardo (spring) — la que hace legible el vuelo.
- **1ª persona**: cabina (el asset ya existe).
- Toggle en vivo con la tecla de cámara (`V`), como ahora.
- **Indicador del buque fuera de cuadro**: flecha en el borde de pantalla. Sin esto, en un espacio
  abierto el jugador se pierde a los 3 segundos.

### 2.5 Combate

- **Cañón**: rayo desde el morro (no desde un píxel de pantalla), contra las cajas de zona.
- **Misil**: mismo gesto y munición de siempre.
- **El buque contraataca en 3D**: trazadoras y flak como objetos del mundo, con **predicción** —
  te disparan a donde vas a estar. Cada AA viva suma volumen de fuego; matarlas lo baja.
- **Impacto = un avión del escuadrón** (igual que ahora).
- **El mar y el casco matan**: chocar es muerte, como en todo el juego.

---

## 3. Decisiones técnicas con número (tomá estas salvo que midas algo mejor)

### 3.1 Escala: 1 unidad = 1 metro

Hoy el buque mide `M3_LEN = 45` unidades para un Tipo 42 real de ~125 m → **1 unidad ≈ 2,8 m**.
Pero el juego 2D razona en **metros** (`RADAR_ALT = 20`, `SHIP_H = 6.5`, y `run.spd` ~62–280 se
integra como metros por segundo). Si el arena hereda las constantes de vuelo en unidades de 2,8 m,
todo va a ir **casi tres veces más rápido** de lo que se siente en el juego.

> **Decisión: el arena usa 1 unidad = 1 metro** y el buque se rehace a escala real
> (~125 m de eslora, ~13 m de francobordo, ~20 m hasta el tope del puente). Así las constantes de
> `flight.js` y `physics.js` se transfieren **sin conversión** y "150" sigue significando 150 m/s.

### 3.2 El triángulo velocidad / radio de giro / tamaño del ring

Es **la** tensión de diseño de esta feature, y hay que resolverla con números, no a ojo:

- Velocidad realista de un A-4 en ataque (~150 m/s = 540 km/h) con giro realista da un radio de
  **kilómetros**: en un ring chico nunca terminarías de virar.
- Punto de partida sugerido (arcade, medilo y ajustá):

| perilla | valor inicial | qué implica |
|---|---|---|
| velocidad | **110–140 m/s** | cruzar el ring entero ≈ 10 s |
| giro | **50–70 °/s** | radio ≈ 110 m, vuelta completa ≈ 6 s |
| radio del ring | **700 m** | el buque (125 m) se ve entero desde el borde |
| techo / piso | **10–450 m** | el piso es el mar (mata); el techo, correa suave |

### 3.3 Un renderer, dos escenas

No crear un segundo contexto WebGL. `renderer.render(scene, cam)` acepta escenas distintas: la
escena del arena es **nueva** (domo + mar centrado + buque), y la del momentum clásico queda como
está para el fallback. Mismo renderer, misma paleta, mismos helpers.

### 3.4 El arena deja de calzar con el 2D

Se termina la equivalencia `proj()` ↔ cámara 3D (`setViewOffset`, el blit con offset `-108,-153`,
el overscan de 696×576). El arena **renderiza a pantalla completa** en la resolución del juego
(480×270, o 2×) y el **HUD 2D va encima**, sin alinearse con nada del mundo salvo por proyección
explícita (corchetes de zona, flecha del buque).

---

## 4. Trampas reales de este repo

1. **`m3Palette()` sin snapshot revienta** — ya arreglado, pero el patrón se repite: la escena
   nueva también va a querer la paleta en el init, antes de tener el primer `w`.
2. **Los stores se MUTAN, nunca se reasignan** (`cfg`, `cam`, `plane`, `run`, `stats`). Lo
   custodia `npm run lint:state`.
3. **La regla del límite**: el sistema del arena **no llama hacia arriba**; devuelve señal y
   `game.js` decide (relevo del escuadrón o derribo).
4. **`plane` (el store 2D) no es el avión del arena.** El del arena tiene orientación 3D. Decidí
   explícitamente si se agrega estado 3D al store o si el arena tiene el suyo propio y `plane`
   queda para el vuelo normal — **y escribilo**, porque la próxima persona lo va a buscar.
5. **Volver del relevo del escuadrón** tiene que recolocar el avión en una posición y orientación
   sanas (encarando el buque, dentro del ring, no dentro del casco).
6. **Legibilidad a 480×270**: un espacio 3D libre en pixel art se convierte en sopa fácil. Sin
   horizonte claro, indicador de buque y altímetro, el jugador se pierde. Es requisito, no adorno.
7. **`?no3d` y el build web (tope 16 MB)** siguen corriendo el **momentum clásico intacto**. No lo
   toques.
8. **`src/game.bundle.js` es generado** (`npm run build:game`). No editar a mano.
9. **El HUD del arena** ya existe (zonas, escuadrón, misiles): conservalo, sumale altímetro,
   velocidad, flecha al buque y aviso de ring.

---

## 5. Plan por etapas

Cada etapa deja el juego jugable y **se prueba en los tres layouts** (`t42`/`t21`/`log`).
La etapa A es la que decide si esto funciona: **no sigas si la sensación no está**.

### Etapa A — El mundo mirable (sandbox de vuelo)
Domo de cielo, mar centrado en el avión con `seaH()` y su alfombra de puntos, niebla, buque
estático a escala real. Cámara de 3ª persona siguiendo un avión que da vueltas **sin combate**.
> **Criterio de salida:** volar 60 s mirando en cualquier dirección sin ver un solo hueco, sin
> perder el horizonte y con el buque siempre ubicable. Screenshot mirando a los 4 rumbos.

### Etapa B — Física y control
Gas contra gravedad, avance por el morro, mira que dirige, alabeo/guiñada coordinados, 1ª/3ª
persona con `V`, ring con aviso y **auto-retorno**.
> **Criterio de salida:** se puede hacer una pasada sobre el buque, salir del ring, ser
> redirigido y volver a atacar, **sin tocar nada más que las teclas de vuelo**. Medir: tiempo de
> vuelta completa, tiempo de cruce del ring, y que soltar el gas realmente te hunda.

### Etapa C — Combate
Cañón y misil por **rayo desde el morro**, zonas 3D con corchetes/HP proyectados, chamuscado,
puntaje, señal `'objective'` al destruir todo.
> **Criterio de salida:** las zonas de las tres clases son **alcanzables volando** (incluidos los
> motores al ras del agua del `t21`) y ninguna se puede batir desde fuera del ring.

### Etapa D — El buque contraataca
Flak y trazadoras como objetos 3D con predicción, cadencia atada a las AA vivas, impacto =
escuadrón, colisión con mar y casco.
> **Criterio de salida:** el fuego se **ve venir** y se esquiva volando; matar las AA se nota;
> morir se entiende (nunca "me mató algo que no vi").

### Etapa E — Legibilidad y HUD
Altímetro, velocidad, flecha al buque fuera de cuadro, aviso de ring, líneas de velocidad.
> **Criterio de salida:** alguien que no programó esto entra y sabe dónde está y qué hacer.

### Etapa F — Cierre
Audio (el motor y el viento como en vuelo, sin bullet-time), entrada/salida del clímax, empalme
con la aproximación, `npm run check` en verde, docs (`ARQUITECTURA`, `ESTADO`, `ROADMAP #12`,
`PENDIENTES_DE_REDISENO` §8).

---

## 6. Verificación (no des nada por hecho sin esto)

1. **Gate completo en verde:**

   ```bash
   npm run check
   ```

2. **Jugado de verdad en Electron**, no solo screenshots: una misión entera desde el despegue
   hasta hundir el buque.
3. **Los tres layouts** (`t42`/`t21`/`log`) y el **fallback `?no3d`** (momentum clásico intacto).
4. **FPS medidos y reportados.** Hoy hay 120 con el mundo a 480×270; una escena 3D con proyectiles
   no puede comerse eso.
5. **Teclado+mouse, gamepad y táctil.** El táctil es el que se rompe: decidí y probá cómo se vuela
   con el dedo antes de dar la etapa B por cerrada.

**Reportá lo que verificaste y lo que no**, y **decí cómo se siente**. Si el vuelo libre resulta
confuso o mareador a esta resolución, es un resultado válido y hay que decirlo con la perilla que
habría que mover — igual que se dijo de la plataforma giratoria que este documento reemplaza.
