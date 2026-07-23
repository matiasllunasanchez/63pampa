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
#4 (bob/wobble, lo pruebo hoy) · #2 (HP + metralla, el HP ya existe) · #10-datos (stats por avión).

**Fase 2 — Fundaciones (destraban lo grande):**
#5 (monedas → base de toda la economía) · #10-cableado (stats afectan el vuelo → base de la asimetría inglesa).

**Fase 3 — Contenido de riesgo medio:**
#9 (enemigos) · #3 (dashes, tras resolver controles) · #15 (Hércules) · #16 (tierra/soldados).

**Fase 4 — Grandes apuestas (cada una pide una decisión de identidad del juego):**
Trío momentum #1/#12/#13 · Economía/roguelike #6/#14 (¿el juego es roguelike o campaña?) · Asimetría #18/#19.

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

---

## Resumen de dependencias

```
#5 monedas ──→ #6 compra ──→ #11 reparaciones/mejoras
                    └──→ #14 roguelike ──→ #13 momentum-poder
#10 stats por avión ──→ #18 asimetría inglesa ──→ #19 radar/base terrestre
#2 HP enemigos ──→ #9 variedad de enemigos
#1/#12/#13 (trío momentum) ── elegir UNA visión primero
```
