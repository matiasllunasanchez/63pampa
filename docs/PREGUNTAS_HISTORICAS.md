# Preguntas históricas — RASANTE

Dudas para consultar con un historiador. **Nada de esto frena el desarrollo**: el juego ya
tiene un dato provisorio cargado en cada caso. Todo el texto vive en el objeto `STRINGS` de
[src/game.js](src/game.js), así que corregir cualquiera de estos puntos es editar un string,
no tocar código.

Formato: qué dice el juego hoy → qué habría que confirmar.

---

## Cifras de bajas

Las que están cargadas hoy en los epílogos:

| Buque | Fecha en el juego | Bajas en el juego | Estado |
|---|---|---|---|
| HMS Sheffield | 4 mayo 1982 | 20 | Chequeado, coincide entre fuentes |
| HMS Ardent | 21 mayo 1982 | 22 | Chequeado |
| HMS Antelope | 23 mayo 1982 | 2 | **Ver nota abajo** |
| HMS Coventry | 25 mayo 1982 | 19 | Chequeado |
| Atlantic Conveyor | 25 mayo 1982 | 12 | Chequeado |
| RFA Sir Galahad | 8 junio 1982 | 48 | **Ver nota abajo** |

### HMS Antelope — 2 bajas
Circula mucho el dato de "22 muertos", que parece ser una copia del número del Ardent.
Lo que encontré: murieron dos personas, el artificiero **James Prescott** (al estallar la
bomba que intentaba desactivar) y el camarero **Mark Stephens** (en el ataque inicial).
→ **Confirmar el número y los dos nombres.**

### RFA Sir Galahad — 48 bajas
El ataque de Bahía Agradable / Fitzroy alcanzó al Sir Galahad **y** al Sir Tristram, con un
total combinado de 56 muertos. El juego atribuye 48 al Sir Galahad solo.
→ **Confirmar el reparto entre los dos buques.**

---

## Atribución de los ataques

El juego te pone en la cabina, así que implícitamente te atribuye cada hundimiento. Habría
que confirmar arma y unidad en cada caso:

- **Sheffield** — el juego dice "un Super Étendard de la Armada Argentina" con Exocet.
  ¿Fue uno o la pareja de aviones? ¿Qué escuadrilla?
- **Coventry** — el juego dice "A-4 Skyhawk de la Fuerza Aérea Argentina".
  ¿Grupo 5 de Caza? ¿Cuántos aviones en la formación?
- **Ardent** — el juego solo dice "oleadas sucesivas" sin atribuir unidad, porque intervinieron
  varias. ¿Vale la pena nombrarlas, o conviene dejarlo genérico?
- **Antelope** — no atribuido en el texto. ¿Qué unidad puso las dos bombas?
- **Atlantic Conveyor** — Exocet desde Super Étendard. ¿Fue impacto directo o el misil se
  desvió desde otro blanco? Hay versiones distintas.
- **Sir Galahad** — el juego dice "Skyhawks argentinos". ¿Fuerza Aérea o Armada?

## Fechas

- **Antelope**: el juego usa el 23 de mayo (día del impacto). La explosión y el hundimiento
  fueron el 24. ¿Qué fecha conviene mostrar como la de la misión?
- **Sheffield**: impacto el 4 de mayo, hundimiento el 10. El juego menciona las dos.

## Otros puntos a revisar

- **"Callejón de las Bombas"** (Bomb Alley) — el juego lo usa en el briefing del Antelope y ya
  aparecía en los datos curiosos. ¿Lo acuñaron los propios británicos? ¿Desde cuándo?
- **Capitán Ian North** del Atlantic Conveyor — está nombrado en el epílogo. Confirmar que
  murió en el ataque y no después.
- **Sir Galahad como cementerio de guerra** — el juego dice que el casco fue hundido mar
  afuera y declarado cementerio de guerra. Confirmar fecha y términos.
- **Tono general**: los epílogos cuentan bajas británicas desde una cabina argentina. Vale
  revisar con alguien si el registro es el adecuado para un homenaje a los veteranos.

---

## Pendiente de contenido (no histórico)

- Las misiones de campaña usan todas la misma configuración de mapa (`CAMPAIGN_CFG`).
  Faltaría clima/terreno propio por misión: San Carlos es un estrecho, no mar abierto.
- Solo las dos primeras misiones tienen guion largo (`storyIntro`, `storyL1`). Las otras
  cuatro entran por el briefing corto. Faltan los guiones de esas cuatro.


---

## Ayudas de terceros países a cada bando

Están cargadas en el ROADMAP (#20 y #21) con su posible expresión jugable. **Hay que
verificarlas con un historiador antes de que salgan del código**, por dos motivos distintos:

1. **Precisión.** Cifras y alcance concretos: ¿fueron 10 los Mirage 5 peruanos? ¿qué entregó
   exactamente Libia y cuándo? ¿qué material soviético llegó y por qué vía?
2. **Peso de la afirmación.** Varias no son datos neutros — son acusaciones que todavía se
   discuten y que involucran a países vecinos y aliados actuales:
   - el rol de **Chile** (radares británicos en territorio chileno, apoyo al SAS, escuchas que
     avisaban los despegues desde el continente)
   - que pilotos **franceses** entrenaran a los británicos para evadir aviones franceses
     vendidos a la Argentina
   - la ayuda **secreta** de Libia
   - el alcance real de la inteligencia satelital de EE.UU. y de la URSS

Para el juego alcanza con que sean **verosímiles y jugables**; para la página de Steam y
cualquier texto que se lea como afirmación histórica, conviene tener la fuente al lado o bajar
el tono a "se atribuye / se ha señalado". No frena el desarrollo: la mecánica se puede construir
igual y el texto se ajusta después.
