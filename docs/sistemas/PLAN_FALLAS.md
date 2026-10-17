# PLAN — LAS FALLAS DEL AVION (POR LA PATRIA y CICLO DE MUERTE)

> El autor (17/10/2026): *"1 de cada 3 aviones que salia a mision tenia que volver por fallas,
> generalmente de reaprovisionamiento; 1 de cada 5 tenia algun error al querer lanzar las bombas
> porque no se desprendian; y una explosion cerca podia dañar alguna parte del equipo."* La idea:
> cada avion de la escuadrilla sale con probabilidad de venir fallado, el jugador lo ve en el
> instrumento, y decide si **aguanta** (hasta que una carta lo repare) o lo **manda a la base**
> (seguro, pero se queda sin esa vida un buen rato).

Solo en los modos sueltos (`suelto()`: POR LA PATRIA y CICLO DE MUERTE). La campaña no se toca.

---

## 0 · Lo que ya hay y se reusa (relevado 17/10)

| Pieza | Donde | Que aporta |
|---|---|---|
| Cambio de avion (tecla **P** / R3) | `systems/squad.js` `cambiar`, `fichaDe`; `run.flota[i]` | cada avion ya guarda SU ficha (nafta, chapa, escudo, bombas, chapitas) — las fallas van ahi |
| Indicador de vidas | `render/hud.js` `drawSquadPips` | un icono por avion: hoy solo acento / espera / derribado |
| Reloj roto | `hud.js` `reloj({roto:true})`, `plateRota`, `vidrioRoto`; `aguja:false`, `tiembla` | el vidrio partido ya existe (hoy solo en el velocimetro sin turbo) |
| Cañones alternados | `systems/flight.js` `gunSide` (l.731), `cad` (l.722) | "dispara uno solo" y "cadencia menor" tienen gancho directo |
| Traba de la bomba | `systems/blanco.js` `tomarBomba`, `bombaInfo().traba` | la mecanica de "no se desprende" ya existe en la suelta |
| Costos en puntos | `data/modos_sueltos.js` `COSTOS` (Chancha 1500, Momentum 800, radar 300, chafitas 400); `cobrar` en game.js | ya se cobran; falta MOSTRARLO |
| Explosion cerca | `collision.js` `softHit` (l.516, la nube de chafitas a < `CHAPITAS.CERCA`) | el lugar donde se tira el dado de falla por esquirla |

**Lo que falta del todo:** un ciclo de cartas fuera de campaña (`trasResultados` solo ofrece en
campaña) y cualquier "volver a la base" con regreso (hoy el averiado de campaña se va y no vuelve).

**Una trampa:** en CICLO, `siguienteBlanco` hace `reset()` y `resetFila` BORRA `run.flota` — las
fichas no sobreviven de un blanco al siguiente. Hay que conservarlas, o las fallas se curan solas.

---

## 1 · El catalogo de fallas

Cada SISTEMA tiene un instrumento que lo dice. Tres grados donde tiene sentido, dos donde no:

| Grado | Como se ve el reloj | En general |
|---|---|---|
| **LEVE** | la aguja tiembla, bisel ambar | anda, pero peor |
| **MEDIA** | vidrio partido, la aguja se traba a ratos | anda a medias |
| **TOTAL** | gris, aguja caida, rotulo **NO FUNCIONA** | eso no existe en este avion |

| Sistema (reloj) | LEVE | MEDIA | TOTAL | Base |
|---|---|---|---|---|
| **REABASTECIMIENTO** (reloj de la Chancha) | carga mas lenta (la canasta da 60%) | se desengancha solo: la caja de la cita mas chica | **sonda rota: sin Chancha** — alcance = lo que cuelga | **33%** |
| **BOMBAS / LANZADOR** (estante) | traba ×2 | la primera de cada pasada se traba siempre | **no se desprenden**: no suelta nada | **20%** |
| **CAÑONES** (reloj del cañon) | recalienta ×1,5 | dispara UNO solo (mitad de cadencia, un fogonazo) | **mudo** | 10% |
| **COMBUSTIBLE** (reloj de nafta) | gasta +15% | fuga: pierde nafta sola | los externos no transfieren: solo el interno | 8% |
| **MOTOR / TURBO** (velocimetro) | acelera menos | sin turbo (el vidrio roto que ya existe) | — (total seria muerte: queda en 2 grados) | 8% |
| **ALTIMETRO** | aguja tiembla ±2 m | atrasa medio segundo | **muerto: se vuela a ojo** — ni banda verde de suelta | 6% |
| **CHAFITAS** (estante, fila de abajo) | una carga menos | — | **no larga** | 6% |
| **HORIZONTE** (ADI) | — | — | muerto (2 grados: bien / total) | 4% |

Los dos primeros son los historicos del autor; el resto, propuesta. **Recomendacion para la v1:
REABASTECIMIENTO, BOMBAS, CAÑONES y ALTIMETRO** — los dos historicos, el que se siente en cada
segundo de juego, y uno que cambia COMO se vuela sin quitar nada.

**Que tan grave:** de cada falla que sale, 50% LEVE · 35% MEDIA · 15% TOTAL (el reabastecimiento,
mas cargado a TOTAL: 35 / 30 / 35, porque el dato historico es "tenia que volver").

**Mas de una a la vez: si, hasta DOS por avion.** Cada sistema tira su dado por separado y se
quedan las dos mas graves. Con las bases de arriba (v1), ~1 de cada 2 aviones sale con algo y ~1
de cada 8 con dos — se siente historico sin volver la escuadrilla un hospital. Perilla: las bases.

---

## 2 · Cuando aparecen

- **Al despegar** (POR LA PATRIA: al empezar; CICLO: en cada blanco nuevo, que es una salida nueva
  — los que ya tenian una falla la conservan, y pueden sumar otra hasta el tope de dos).
- **Por esquirla:** una explosion CERCA (la nube de chafitas que revienta un misil a < `CERCA`, el
  flak que pasa raspando, el estallido que se atraviesa tarde) tira un dado: **25%** de dañar un
  sistema — 40% bombas, 40% cañones, 20% el resto —. Si el sistema ya estaba fallado, sube un grado.

## 3 · Como se entera el jugador

- **Al cambiar de avion (P):** el cartel de arriba dice el avion y sus fallas (*"C-244 · SONDA
  ROTA · UN CAÑON"*) y los relojes pasan al estado de ESE avion en el acto.
- **En vuelo, el indicador de vidas:** cada icono en su color — **verde** bien, **ambar** con
  fallas, **rojo** con una TOTAL o con dos fallas — y titila el que tiene una TOTAL. Es la
  escuadrilla de un vistazo: a quien conviene pasarle el mando.
- **El que esta en la base:** icono gris con un arco que se llena (lo que le falta para volver).

## 4 · AGUANTAR o MANDAR A LA BASE

- **A LA BASE** (tecla nueva, p. ej. **B** / un boton del mando): el que vuela se va —la cinematica
  del averiado que ya existe, humeando y virando— y entra el siguiente de la fila. El que se fue
  vuelve **REPARADO Y CON NAFTA** al cabo de un **tiempo largo**: propuesta **90 s** en POR LA
  PATRIA, **un blanco entero** en CICLO. Mientras tanto no cuenta como vida.
- **No se puede mandar al ultimo.** Y si el que vuela muere con los demas en la base: se pierde
  (la apuesta era esa).
- **AGUANTAR:** seguir con el fallado hasta que el ciclo de cartas ofrezca una REPARACION.

## 5 · El ciclo de cartas de los modos sueltos (no existe: hay que hacerlo)

Cada **blanco hundido** en CICLO, y cada **N puntos** (o minutos) en POR LA PATRIA, la pantalla de
cartas de la campaña ofrece 2 de 3. Ademas, al llegar al ciclo, un **regalo fijo de municion**.

- **TALLER LIVIANO** — repara hasta 3 aviones con fallas LEVES o MEDIAS.
- **TALLER PESADO** — repara 1 avion de una falla TOTAL.
- **VUELTA RAPIDA** — los que estan en la base vuelven ya.
- **MUNICION** — +1 bomba por avion / +1 carga de chafitas (la Chancha NO recarga municion: solo
  nafta, como hoy).

## 6 · Lo que cuestan los poderes (pedido del mismo dia)

Ya se cobran (Chancha 1500, Momentum 800; Rasante gratis). Falta **verlo**: al usar uno, sale
**arriba del indicador de ese poder** el `-1500` en el color del poder, y sube y se apaga.

---

## 7 · Orden de trabajo propuesto

1. **F1 — datos y dados:** `data/fallas.js` (catalogo + bases + grados), la tirada al despegar, la
   falla guardada en la ficha de cada avion (y arreglar que CICLO no borre `run.flota`). Tests.
2. **F2 — efectos v1:** reabastecimiento, bombas, cañones, altimetro.
3. **F3 — los relojes:** LEVE / MEDIA / TOTAL generico en `reloj()` (sobre `roto` y `tiembla`).
4. **F4 — vidas y cartel:** colores, titileo, cartel al cambiar.
5. **F5 — A LA BASE** con el regreso.
6. **F6 — esquirlas.**
7. **F7 — cartas de los modos sueltos** (TALLER, VUELTA RAPIDA, MUNICION).
8. **F8 — el `-1500` de los poderes** (chico, independiente: puede ir primero).
