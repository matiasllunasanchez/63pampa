# PLAN · PRIMERA PERSONA (la cabina)

_12/10/2026 — análisis y planificación, todavía sin código._

**Pedido del autor.** Jugar el mismo juego desde la cabina. Mismo mundo, misma sensación visual y mismo
control, pero con la cámara en el ojo del piloto. Una cabina modelada en Blender con los instrumentos
que hoy están en el HUD, y en lo posible jugable con un HOTAS. Lo único que cambia es la vista; el
avión siempre avanza, como hoy.

**Veredicto.** Es posible y no es descabellado. Es un feature **grande**, del tamaño del horno de
Blender. Hay una buena noticia y una mala:

- **La buena:** el vuelo ya es independiente de la cámara. El avión vive en coordenadas de mundo
  (`plane.x/y`, `run.dist` siempre avanzando, flight.js:234, :285-307). Las colisiones también son de
  mundo (collision.js:69-101). Así que cambiar la vista **no toca la física ni el juego**.
- **La mala:** todo el render asume que el ojo está **14 m detrás** del avión (`PZ = 14`) y que el
  ojo **no cabecea** (el horizonte `HOR` es una constante). Mover el ojo a la cabina obliga a tocar el
  proyector y todos los dibujos de suelo, mar y relieve.

---

## 1. Qué hay hoy

| Pieza | Estado | Dónde |
|---|---|---|
| Proyección | `proj(x,y,z)`: ojo en z = 0, sin yaw ni pitch, horizonte fijo en `HOR` | core/fx.js:24-35, render/ctx.js |
| Cámara | persigue al avión con retardo, 2,6 m arriba, con un piso de 3,4 m | systems/vuelo.js:107-128 |
| Suelo y mar | escaneo por filas: `z = cam.y·F/(y−HOR)`, con el ojo en z = 0 | render/world.js:466, 514, 763 |
| Rolido del mundo | `ctx.rotate` de toda la pantalla, después de proyectar: ya sirve para la cabina | core/horizon.js, game.js:5005 |
| Cabina existente | **una** imagen fija (`cockpitv3.png`) con un bamboleo y la sal; sin relojes vivos | legacy/momentum_render.js:391-470 |
| Quién la usa | EL PULSO (`cam: 'cabina'`), el arena (en cuarentena) y la pasada | render/pulso.js, render/arena.js, render/pasada.js |
| `cockpitv4.png` | existe y nadie la usa | assets/planes/ |
| Cámaras del pasillo | `CAM_ZOOMS = [1]`: un muñón; el comentario ya anticipa la cabina | game.js:2683, :2940 |
| Relojes del HUD | dibujados en canvas en vivo (agujas, marcas, la bola del ADI); tamaño fijo 26×26 | render/hud.js |
| three.js | solo el mar 3D opcional y el arena (cuarentena); sin GLTFLoader | legacy/three-world.js, systems/three-arena.js |
| Mando | API Gamepad; el stick izquierdo **se digitaliza** (0/1); zona muerta 0,35; sin mapeo por dispositivo | core/input.js:520-729 |
| Acelerador | **no existe** como eje: `inp.u` es “gas/trepar” todo o nada | flight.js:110-112, 301 |

---

## 2. La decisión central: cómo se dibuja la cabina

**Recomendado: la cabina horneada en Blender como CAPAS 2D, con los relojes vivos encima.** Es el
mismo camino que todo el juego (pixel art horneado, dibujado en canvas):

- **Fondo de cabina:** tablero, consolas laterales, palanca y acelerador, horneados desde el ojo del
  piloto.
- **Marco del canopy y arco del parabrisas:** una capa aparte, para que se pueda mover un poco
  respecto del tablero (paralaje al mover la cabeza).
- **Agujeros de los instrumentos:** el horno exporta **anclas** (centro y radio de cada reloj, en
  JSON, como `anclas_horno.js`). El juego dibuja ahí los relojes de hud.js, escalados.
- **La mira:** el vidrio del colimador, con la retícula viva encima.
- **Palanca y acelerador:** unos pocos cuadros horneados por posición (como las poses del avión) que
  siguen a la entrada. El jugador ve su mano moverse cuando mueve el HOTAS.

**Descartado: una cabina 3D en vivo con three.js.** Sería un renderer más, tapado por el mundo 2D, y
rompería la sensación visual (pixel art contra polígonos). Solo valdría la pena si algún día se quiere
mirar 90° a los costados, y esto no lo permite (ver §5).

---

## 3. Fases

Cada fase termina con algo jugable y una decisión del autor antes de seguir.

### F0 · Espiga: “¿se siente?” (1-2 días)
- Ojo en el avión con lo mínimo: `cam.x = plane.x`, `cam.y = plane.y + 0,6` y la profundidad
  re-basada en el proyector.
- `cockpitv4.png` encima, sin relojes.
- Rolido con el horizonte que ya existe.
- **Objetivo:** volar el pasillo y ver si esquivar mástiles, olas y buques funciona desde adentro.
  **Es la fase que decide si el resto vale la pena.**

### F1 · La cámara de cabina de verdad
- **`cam.z` (profundidad del ojo):** entra en `proj` y en las fórmulas del escaneo de suelo, mar y
  relieve (world.js, colinas.js, islas.js, paredes.js).
- **Los cortes cercanos fijos** (`camZ ≥ 6`, `z ≤ 3`, `z < 2`…, una docena) pasan a ser relativos al
  ojo.
- **Lo que pasa por detrás del ojo** se descarta antes de proyectar. Hoy nada llega a z ≤ 0 porque
  siempre hay 14 m de margen.
- **CABECEO:** el horizonte deja de ser constante: `HOR` pasa a ser `horizonte()` y sube o baja con
  `plane.pitch`. Es el cambio más extenso: lo leen todos los renderers de filas.
- **La cabeza:** el retardo y el sacudón de la cámara pasan a ser del piloto. Los G y el turbo
  aprietan la cabeza contra el asiento.
- **Selector de vista:** tercera / cabina, con `V` y el botón 13 del mando (`cycleCamera` ya existe).

### F2 · La cabina en Blender (empezar por el A-4)
- Modelo del interior del A-4B: tablero con los mismos instrumentos que el HUD (salud, nafta,
  velocidad, Mach, altímetro, gas, ADI, cañón, carga), consolas, palanca, acelerador, el colimador y
  el canopy.
- Horneado desde el ojo en capas (§2), con las anclas de los relojes.
- Iluminación con el sol del cielo de cada misión. Variantes por luz: día, atardecer y noche (la
  noche con los relojes iluminados).

### F3 · Los relojes en el tablero
- **hud.js se parte en dos:** los **valores** (hoy calculados adentro de `drawHUD`) en una función
  propia, y cada reloj dibujable en `(x, y, escala)`.
- El tablero los pone en sus anclas. El HUD de tercera persona sigue igual, con el mismo código.
- **Lo que no tiene lugar en un tablero** (la barra del objetivo, los diálogos, los carteles) queda
  como HUD mínimo arriba, como hoy.

### F4 · El juego desde adentro (ajustes)
- **Retícula:** la mira vive en el colimador. Hoy se dibuja adentro de `drawPlane`, que en cabina no
  corre, así que hay que sacarla de ahí.
- **Fogonazos y trazadoras:** salen de las raíces del ala o de la trompa, vistas desde el ojo.
- **La bomba:** la trayectoria y el aviso de suelta, desde la cabina.
- **“Cercanía”:**
  - avisos de borde del pasillo (hoy se ve el avión contra el borde);
  - la sombra del avión en el agua como referencia de altura, vista hacia abajo;
  - escalas de olas y de chapitas.
- **El ancho del avión:** desde adentro no se ve cuánto mide de punta a punta. Puede hacer falta una
  marca de puntas de ala en el canopy o hitboxes un poco más generosas en esta vista.

### F5 · El HOTAS, “leve, casi como un joystick” (decisión del autor, 12/10)
El HOTAS **no cambia el modelo de vuelo**: se lee como un mando más. No hay acelerador analógico que
mande la velocidad, ni simulación. Alcanza con esto:
- **El stick, analógico:** hoy el stick izquierdo se digitaliza (0/1). Pasa a mover lateral y vertical
  proporcional, con zona muerta chica (0,05-0,1). Mejora también el mando común.
- **Asignación simple:** los HOTAS llegan con `mapping: ''` y ejes y botones en cualquier orden. Hace
  falta una pantalla corta de **“mové el eje / apretá el botón”** para stick X, stick Y, disparo,
  bomba, turbo, freno y vista, guardada por `gamepad.id`. Sin calibraciones finas.
- **El acelerador físico:** opcional y como **botón**: adelante de todo = turbo, atrás de todo =
  freno, en el medio no hace nada. Mismo juego, sin un eje nuevo en la física.
- **El sombrero (hat):** cambiar de vista (tercera/cabina) o mirar unos grados. Ver el límite en §5.
- Probar con un HOTAS real (Thrustmaster T.Flight u otro): el target es Electron y la API Gamepad de
  Chromium lo ve sin drivers.

### F6 · Las seis cabinas y el pulido
- Dagger y Mirage (otra cabina), Super Étendard, A-4Q y Pampa.
- Reflejos en el vidrio, gotas y sal (reusa `drawSal`), el sol que encandila.
- EL PULSO y la pasada usan la cabina nueva (adiós a `cockpitv3.png`).

---

## 4. Tamaño estimado

| Fase | Esfuerzo | Riesgo |
|---|---|---|
| F0 espiga | 1-2 días | bajo; decide todo lo demás |
| F1 cámara | 1-2 semanas | **alto**: toca todos los renderers de mundo |
| F2 cabina A-4 | 3-5 días | medio: modelado e iteración con el autor |
| F3 relojes | 3-4 días | bajo |
| F4 ajustes | 1 semana | medio: es diseño de juego, se itera jugando |
| F5 HOTAS leve | 3-4 días | bajo: es un mando más, con asignación de ejes y botones |
| F6 seis cabinas | 1-2 semanas | bajo |

---

## 5. Límites honestos

- **Mirar a los costados de verdad (girar la cabeza 90°) no entra.** El mundo se proyecta sin yaw: el
  pasillo existe solo hacia adelante. El sombrero puede correr la vista unos grados (desplazar el
  punto de fuga y la cabina en 2D, como ya hace el zigzag con `bendW`), pero no ver por la ventanilla
  lateral. Hacerlo de verdad sería el arena 3D, otro juego.
- **El cabeceo es aproximado.** Mover el horizonte simula bien ±15-20°, que alcanza para trepar y
  picar en el pasillo. Las piruetas grandes (el mortal, la cobra) se ven mejor desde afuera: en cabina
  conviene **pasar a tercera durante la pirueta** y volver, como un corte de cámara.
- **Rendimiento:** con el ojo a 1-2 m del agua, el escaneo del mar cubre más filas cercanas. Hay que
  medirlo en F0.
- **Lo que el jugador pierde:** ver su propio avión, que hoy es el centro de la sensación (el alabeo
  horneado, la tobera, la estela). Por eso la cabina es una **vista opcional**, no un reemplazo.

---

## 6. Preguntas para el autor

1. ¿La cabina es una vista que se elige (tercera / cabina) o un modo de juego aparte?
2. ~~¿Con HOTAS, el acelerador manda la velocidad?~~ Resuelto (12/10): HOTAS leve, como un joystick (§F5).
3. ¿Durante las piruetas grandes se corta a tercera, o se quedan en cabina como se puedan ver?
4. ¿Empezamos por la espiga F0 para sentirla antes de modelar nada?
