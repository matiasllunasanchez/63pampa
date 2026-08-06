# Análisis del roadmap

Mi lectura de cada ítem de [ROADMAP.md](ROADMAP.md): idea/propuesta, **facilidad** de aplicación
(anclada en cómo está el código hoy) y de qué depende. Referencio por número; el *qué* está en el
roadmap, acá va el *cómo y cuánto cuesta*.

**Escala de facilidad:** 🟢 Fácil · 🟡 Media · 🔴 Difícil · 🎲 Gran apuesta (pide decisión de diseño antes que código).

---

## Lo primero: dos decisiones que bloquean

1. **El "trío momentum" (#1, #12, #13) son tres visiones del MISMO subsistema.** Primera persona a
   velocidad real, otro momentum rasante, y momentum-como-poder. Si arrancás a construir sin elegir
   una dirección, rehacés el clímax tres veces. **Decidir la visión antes de tocar código.**

2. **El joystick ya está lleno.** #3 (dashes en L1/R1) choca: hoy L1 invierte el throttle y R1 fija
   la mira. Antes de los dashes hay que **rediseñar el layout de controles** (o mover esas dos a
   otro lado). Es una decisión de 10 minutos, pero hay que tomarla.

## Orden que sugiero

**Fase 1 — Quick wins de sensación (bajo riesgo, alto impacto, se puede ya):**
~~#4 (bob/wobble)~~ ✅ hecho · ~~#22-v1 (panel de estado)~~ ✅ hecho · ~~#2 (HP + metralla)~~ ✅ hecho ·
#10-datos (stats por avión) ← **el único que queda de la Fase 1**.

**Fase 2 — Fundaciones (destraban lo grande):**
#5 (monedas → base de toda la economía) · #10-cableado (stats afectan el vuelo → base de la asimetría inglesa).

**Fase 3 — Contenido de riesgo medio:**
#9 (enemigos) · #3 (dashes, tras resolver controles) · #15 (Hércules) · #16 (tierra/soldados).

**Fase 4 — Grandes apuestas (cada una pide una decisión de identidad del juego):**
Trío momentum #1/#12/#13 · Economía/roguelike #6/#14 (¿el juego es roguelike o campaña?) ·
Asimetría y aliados #18/#19/#20/#21 (la asimetría con su capa geopolítica: qué apoyó a cada bando).

---

## Ítem por ítem

### #1 — Momentum en primera persona a velocidad de juego · 🔴
El momentum ya es un módulo aislado (`systems/momentum.js`, 378L) y el mundo 3D existe
(`systems/three-world.js`) → la base técnica está. Pero pasar de bullet-time a velocidad real con
un blanco móvil es un **rework del clímax**, no un ajuste. **Propuesta:** prototiparlo como un MODO
alternativo (detrás de un flag), sin reemplazar el actual, para comparar sensación. **Riesgo:** es
el clímax y es difícil de testear headless. **Depende de** la decisión del trío momentum.

### #2 — Barra de vida + metralleta más larga · 🟢🟡
**Los enemigos YA tienen HP** (globo 1, helo/jet 2, en `spawn.js`) y la metralla ya tiene
calor/`overheat` (`flight.js`: `+0.10` de calor por tiro, overheat en 1). Entonces esto es casi
todo *tuning + una barra*: (a) barra visible sobre el enemigo (render), (b) subir HP a algunos, (c)
bajar el calor por tiro o subir el techo. **Veredicto: quick win con alto impacto en el feel de
combate — empezar por acá.**

### #3 — Dashes de esquive cinemáticos · 🟡
La pirueta/roll ya existe y es reusable; el trabajo real es la **animación** (arte/feel, iterativo)
y **resolver el mapeo** (L1/R1 ocupados). **Propuesta:** el dash es un roll con desplazamiento
lateral real + estela + deformación (no una rotación plana de sprite). **Bloquea:** el layout de
controles (ver arriba).

### #4 — Bob + micro-wobble · 🟢
Ya hay un bob básico en `render/plane.js`; esto lo profundiza tuneando 3 perillas (0.42 rotación,
0.26 foreshortening, dt·9 suavizado). Es iterativo y **lo puedo probar en el preview ahora mismo**.
**Veredicto: el quick win más barato — lo hago y te lo muestro cuando quieras.**

### #5 — Sistema de monedas · 🟡
La plomería existe: `freezeRun()` arma el recuento y `render/screens.js` lo dibuja. Falta convertir
puntaje→monedas, **persistir el saldo** (localStorage) y mostrarlo. Es la **base de la economía**.
**Veredicto: hacerlo antes que #6/#11/#14 — sin monedas no hay compra ni progresión.**

### #6 — Dinámica de compra (roguelike/mercado) · 🎲
Depende de #5. Es una decisión de diseño grande. **Propuesta:** no diseñar todo de una — arrancar
con un **mercado mínimo** (2-3 mejoras compradas con monedas) y ver si engancha antes de invertir en
un roguelike completo. **Veredicto: decidir modelo, iterar chico.**

### #7 — Niveles · 🟡
Más diseño que código: la campaña ya encadena 6 misiones y hay diseño en [NIVELES.md](NIVELES.md).
**Veredicto: definir alcance (¿los 12 de NIVELES?) antes de codear; el motor ya lo soporta.**

### #8 — Más adrenalina a ras · 🟡 (paraguas)
No es UNA feature — es un objetivo que se cumple con #3, #4 y mecánicas nuevas. **Propuesta
concreta:** ventanas de tiempo a ras que suban el multiplicador, obstáculos que obliguen a bajar,
premiar más los casi-choques (el `graze` ya existe). **Veredicto: convertirlo en features
concretas; como está no es accionable.**

### #9 — Variedad de enemigos · 🟡
`spawn.js`/`collision.js` quedaron limpios y contenidos tras el refactor → sumar tipos es acotado.
**Propuesta:** 2-3 enemigos con patrón (uno que dispara, mina flotante, uno que esquiva). **Depende
de #2** (el HP hace que valga la pena la variedad). **Veredicto: buen retorno una vez que #2 esté.**

### #10 — Aviones con características distintas · 🟢🟡
**Hallazgo:** los 5 aviones YA tienen descripciones que prometen diferencias ("más rápido y con más
fuego", "misiles Exocet") pero **hoy son solo cosméticos** — el código no las cumple. **Propuesta:**
stats por avión en `data/planes.js` (velocidad, maniobra, fuego, HP) que `flight.js` lea. Datos:
fácil. Cableado: medio. **Es la base de #18. Veredicto: alto valor — cumple una promesa que ya está
escrita en el juego.**

### #11 — Reparaciones y mejoras · 🔴
Progresión; depende de la economía (#5/#6). **Veredicto: después de #5/#6.**

### #12 — Otro momentum rasante · 🎲
Variante de #1. **Veredicto: parte de la decisión del trío momentum, no una feature suelta.**

### #13 — Momentum como "poder" en vivo · 🟡🔴
El momentum existe; falta un **sistema de poderes** (cooldown, activación) y un gatillo de entrada
manual. **Propuesta:** si hacés #14, este es *un poder más* dentro de ese sistema. **Veredicto:
encaja natural dentro de un sistema de poderes; suelto, es de esfuerzo medio.**

### #14 — Roguelike con poderes por nivel · 🎲
Meta-sistema grande. **Veredicto: la apuesta más grande. La pregunta de fondo no es técnica — es
"¿el juego es run-based roguelike o campaña narrativa?". Es una decisión de identidad; definila
antes de construir.**

### #15 — Reabastecimiento con el Hércules · 🟢→🟡
El pickup de combustible ya existe (+30, en `collision.js`). **v1** (Hércules arriba con manguera) =
un actor nuevo + reusar el pickup → fácil y vistoso. **v2** (sobrevuelo manteniendo la conexión unos
metros) = mini-mecánica de "mantener posición X segundos" → media, pero **muy temática y
adrenalínica** (encaja con #8). **Veredicto: v1 rápido; v2 es una perlita.**

### #16 — Tierra + soldados · 🟡
Todo acotado: `render/world.js` (`drawLand`), spawn de soldados, `collision.js`. **Veredicto:
contenido incremental de bajo riesgo.**

### #17 — Nuevas mecánicas y terrenos · 🟡 (abierto)
El sistema de terreno existe (`cfg.terrain` sea/land). Sumar uno nuevo es medio. **Veredicto:
definir qué terreno/mecánica concreta querés antes de estimar.**

### #18 — Jugar con los ingleses (asimetría) · 🎲
**Depende de #10** (stats por avión) como base técnica. Es contenido + diseño + carga narrativa
fuerte. **Propuesta:** un "bando" con aviones de stats generosos (radar propio, estabilidad, más HP)
vs el argentino exigente — la asimetría la habilita #10, la narrativa la refuerza #19. **Veredicto:
apuesta grande; construir sobre #10 y #19.**

### #19 — Radar inglés vs base terrestre argentina · 🟡🔴
La detección/radar ya existe (`flight.js`: `detection` sube en altura y dispara un misil).
**Propuesta:** el inglés tiene radar propio (siempre sabe dónde estás); el argentino **necesita que
una BASE TERRESTRE (actor/sistema nuevo) le avise** → hay una ventana de vulnerabilidad cuando no
hay aviso. Sistema nuevo pero acotado. **Veredicto: mecánica con sentido narrativo y de gameplay;
parte natural de #18.**

### #20 — Ayuda de países aliados a la Argentina · 🟡🎲
La facilidad depende de la forma. La versión **"un aliado sobrevuela y te deja algo"** reutiliza el
patrón del Hércules (#15: actor aliado en el aire + pickup) → media. La versión **"bando con ayudas
sistémicas"** ya es parte de la apuesta de asimetría → gran apuesta. **Propuesta:** no diseñar un
sistema geopolítico — elegir **1-2 ayudas concretas** y hacerlas features palpables (un pickup
especial, un aviso de radar, un arma extra), cada una atribuida a un país. **Depende de #15** (patrón
de aliado) y **#10** (si la ayuda se expresa como tecnología/stats). **Veredicto: empezar chico y
concreto; es el platillo argentino de la balanza — le da sentido a que el avión sea exigente.**

### #21 — Ayuda de países aliados a Inglaterra · 🎲
Es el **otro platillo de #18**, no una feature suelta: es lo que **justifica** la ventaja inglesa
(que no sea "es mejor porque sí"). No tiene sentido construirlo aislado. **Propuesta:** cuando hagas
#18/#19, presentá las ventajas inglesas (radar propio, estabilidad, más HP, reabastecimiento) **como
"ayudas de aliados"**, dándoles peso narrativo. Es diseño + narrativa sobre la base técnica de #10.
**Veredicto: va pegado a #18/#19 — es su capa de sentido, no un desarrollo separado.**

### #22 — Panel de daños por partes del avión · 🟢 (v1) / 🎲 (v2)
**Hallazgo que manda sobre todo el ítem: hoy el jugador NO tiene vida.** Todo choque es muerte
instantánea (`{ death }` en `collision.js`; el roce agota `scrapeT` en `flight.js`) y **solo los
enemigos tienen `hp`**. Así que el panel no es un problema de UI: es la punta visible de "¿el avión
pasa a tener integridad?".

**Por qué eso no es trivial:** la muerte de un toque es lo que hace tenso el vuelo rasante. Si el
avión aguanta tres golpes, el rasante se vuelve barato. No es un "más es mejor" — hay que decidirlo.

**Propuesta en dos escalones:**
- **v1 — panel de estado (🟢) — ✅ HECHO:** silueta del avión **de espaldas** (misma vista que el
  sprite en vuelo) en el borde izquierdo, en espejo con la palanca de gas. Alas = calor/`overheat`,
  motor = `run.fuel`, panza = `run.scrapeT` contra `scrapeLimit()`. Cero sistemas nuevos, puro
  `render/hud.js` (`drawStatusPanel()`). **El margen de roce era el único de los tres que no se
  veía en ningún lado** — y como al salir del roce `scrapeT` se descuenta lento, la panza queda
  castigada y se recupera sola, que es justo la lectura que se quiere de un panel de daños.
- **v2 — daño por partes (🎲):** cada parte con su integridad, y el daño **degrada un stat concreto**
  (ala → maniobra, motor → velocidad). Recién acá el panel informa de verdad. **Depende de #10**
  (sin stats por avión no hay nada que degradar) y **habilita #11** (si hay daño, hay reparaciones).

**Veredicto: hacé la v1 como quick win de HUD — se ve bien y no compromete nada. La v2 no la
arranques hasta decidir la regla de muerte, porque toca el corazón de la tensión del juego.**

### #23 — Cuarta estrella: las Malvinas (rango "S") · 🟢🟡 — ✅ HECHO (falta persistencia)
**Hallazgo: el sistema de estrellas YA existe** — `freezeRun()` calcula 1/2/3 estrellas contra el
`par` de la misión, `drawResults()` las dibuja con rebote, y hay un `rank` paralelo por precisión.
Así que esto no se construye de cero: se **extiende**.

**El trabajo real es de dos tipos:**
- **Fácil (🟢):** la lógica. Sumar un 4º tramo al umbral (ej. `total ≥ par*2` → 4) y unificar la 4ª
  estrella con el rango máximo, para que no haya dos indicadores de "excelente" compitiendo.
- **Medio (🟡):** el arte. La 4ª no es un `★`: es la **silueta de las islas en dorado**, con su
  propio momento de aparición (idealmente distinto y más celebrado que las estrellas comunes). Vale
  hacerla especial — es el remate emocional del nivel.

**Dos decisiones a tomar antes de tocar:**
1. **¿Qué tan difícil es sacar las Malvinas?** Si cae fácil, pierde el peso de "excelente". El `par`
   por misión ya está en `data/missions.js`, así que el umbral se puede calibrar por nivel.
2. **¿La 4ª estrella reemplaza al `rank` de texto o convive?** Recomiendo **reemplazar**: "sacaste
   las Malvinas" dice más que "rango: HALCÓN", y evita redundancia.

**Engancha con:** persistir estrellas por nivel abre la puerta a un **selector de niveles con
progreso / 100%** (relacionado con #7 niveles y #5 si las estrellas alguna vez dieran recompensa).
**Veredicto: quick win de lógica + una perlita de arte. Alto valor emocional por poco código; el
único cuidado es que las Malvinas se sientan MERECIDAS (umbral exigente).**

### #24 — Minijuego terrestre (piloto/soldado en tierra) · 🎲
La apuesta más "otro juego" de toda la lista: es un **segundo loop de gameplay**, no una feature del
vuelo. La buena noticia es que **el motor ya sabe hacer esto** — el momentum es exactamente eso: un
estado con su propio `update`/`draw` que reemplaza el mundo aéreo. Así que la arquitectura no es el
problema; el problema es **diseñar un juego nuevo, chico pero completo**.

**Lo que ya se puede reusar:** el render de tierra (`drawLand`), el sprite de soldado, el sistema de
partículas y el de estados. **Lo que hay que crear de cero:** control del personaje a pie, cámara,
amenazas terrestres, condición de victoria/derrota, y el bucle de recolección.

**Antes de estimar hay que decidir tres cosas (están en el roadmap):** cuándo entra, qué género, y
qué recupera. Cada respuesta cambia radicalmente el alcance:
- *Cenital de recolección simple* (juntar N piezas esquivando patrullas) → **acotado**, un fin de
  semana. Buen primer intento.
- *Sigilo o plataformas con progresión* → **grande**, es casi un proyecto propio.

**Recomendación:** si se hace, arrancar por la versión **mínima** — caés, juntás 3 piezas evitando
patrullas, volvés. Ver si el cambio de ritmo engancha ANTES de invertir en algo ambicioso.
**Depende, para tener sentido, de que exista la economía/reparación (#11/#5)** — si no, las piezas
no van a ningún lado. **Veredicto: gran apuesta con arquitectura ya resuelta; el riesgo es de diseño
y de alcance, no técnico. No arrancar sin la economía que le dé destino a las piezas.**

---

## Resumen de dependencias

```
#5 monedas ──→ #6 compra ──→ #11 reparaciones/mejoras
                    └──→ #14 roguelike ──→ #13 momentum-poder
#15 aliado (Hércules) ──→ #20 ayudas a Argentina
#10 stats por avión ──→ #18 asimetría inglesa ──→ #19 radar/base terrestre
                                 ├──→ #20 ayudas a Argentina (contrapeso)
                                 └──→ #21 ayudas a Inglaterra (su justificación narrativa)
#2 HP enemigos ──→ #9 variedad de enemigos
#10 stats por avión ──→ #22 panel de daños (v2) ──→ #11 reparaciones/mejoras
#5 monedas / #11 reparaciones ──→ #24 minijuego terrestre (le da destino a las piezas)
#1/#12/#13 (trío momentum) ── elegir UNA visión primero
#22 (v2) ── decidir antes la REGLA DE MUERTE (hoy: un toque = muerte)
```
