# PLAN — «EL INVINCIBLE» (libro de vuelo r5)

*Diseño del autor, 15/10/2026, armado de a mensajes. Va al LIBRO DE VUELO (`src/data/libro_vuelo.js`).*

## El hecho (verificado)

**30 de mayo de 1982.** Dos Super Étendard de la Armada —uno con **el último Exocet** que quedaba,
el otro de apoyo con su radar— y **cuatro A-4C** de la Fuerza Aérea (Grupo 4, indicativo «Zonda»
según ASN) con bombas de 250 kg. Salen de Río Grande (los A-4C a las 12:30) y cargan de **dos
KC-130** en la ida. Entran por el sur del grupo de portaaviones.

- **Versión argentina:** el Exocet y las bombas alcanzaron al **HMS Invincible**.
- **Versión británica:** el Exocet se desvió y cayó al mar; **dos A-4C derribados** (probablemente
  Sea Dart, HMS Exeter) y los otros dos atacaron a la fragata **HMS Avenger** sin acertar.

Fuentes: [Conclusión](https://www.conclusion.com.ar/?p=47512), [Canal 26](https://www.canal26.com/historia/2025/07/25/guerra-de-malvinas-el-ataque-a-la-invencible-joya-de-la-flota-britanica-que-los-ingleses-nunca-reconocieron/),
[RNA](https://royal-naval-association.co.uk/news/30-may-missile-attack-misses-british-carriers),
[ASN C-301](https://cdn.aviation-safety.net/wikibase/54611),
[Wikipedia](https://en.wikipedia.org/wiki/Naval_Air_Fighter_Attack_Squadron).

## El diseño (palabras del autor)

> *"el superetendard debe lanzar el exocet mas lejos del objetivo que un skyhawk pero debe completar
> el pulso, y luego se va, y luego el skyhawk debe perseguir el misil y custodiarlo hasta estar MUY
> CERCA como cuando pasaban al dejar las bombas"* · *"podemos directamente ser ambos, primero el
> super, y luego el skyhawk que viene de atras con el escuadron a rodear el misil"* · *"tenemos que
> disparar frente del misil para protegerlo"* · *"es el unico caso donde el skyhawk no hace falta que
> lance ninguna bomba sino defender todo lo que quiera chocar o destruir al misil"* · *"la formacion de vuelo seria la misma que el
> despegue al inicio, y luego los Etendard se van y el misil queda en el medio y los skyhawk
> alrededor"* · *"y van muriendo mis compañeros hasta que el jugador queda solo con el misil"*

1. **DESPEGUE EN FORMACIÓN** — los dos Super Étendard y los A-4C, la misma formación del despegue.
   El jugador es el Super Étendard.
2. **LA IDA** — el Hércules en la ida (la cita de siempre), el silencio de radio de PATRIA 2.
3. **EL PULSO, MÁS LEJOS** — el Exocet se lanza a más distancia que en el Sheffield (el buque más
   chico en el parabrisas).
4. **EL CAMBIO** — los Super Étendard viran y se van; el Exocet queda en el medio y los A-4C
   alrededor, en formación. El jugador pasa a ser un A-4C **sin cortar la misión**.
5. **LA ESCOLTA** — el misil vuela adelante (líder de PERSECUCIÓN, con su banda de distancia). Se le
   cruzan amenazas (helicópteros, misiles de la flota) y **hay que dispararles adelante del misil**.
   **Los compañeros van cayendo** (Sea Dart) **hasta que el jugador queda solo con el misil**.
6. **EL BLANCO** — **el A-4C no suelta nada** (es el único caso del libro): su trabajo era que el
   misil llegara. El Exocet llega al portaaviones y la misión se cierra ahí. Si el misil cae antes
   (lo chocó algo, lo derribaron), la misión se pierde.
7. **LO QUE PASÓ** — las dos versiones.

**Licencia de juego, dicha:** en el juego caen todos los compañeros; en la realidad cayeron dos de
cuatro. La tarjeta final lo cuenta.

## Fases de construcción

| Fase | Qué | Con qué |
|---|---|---|
| **I1** | La salida en los datos: tramo SuE (Pulso lejos, un Exocet) | `libro_vuelo.js`, `pulso` (`pulsoLejos`) |
| **I2** | EL CAMBIO: al terminar el Pulso, el jugador pasa a A-4C (avión, carga, escuadrón) y la misión sigue | `game.js` (`libro` en dos tramos) |
| **I3** | EL EXOCET COMO LÍDER: la persecución con el misil adelante (sprite del misil, sin esquive de avión) | `persec.js` / `render/persec.js` (`tipo: 'exocet'`) |
| **I4** | LA FORMACIÓN: los A-4C alrededor del misil, en los puestos del despegue | `render/squad.js` (`formationSlots`) |
| **I5** | LAS AMENAZAS AL MISIL (todo lo que lo pueda chocar o destruir se le cruza adelante y hay que tirarle) y los compañeros que caen | `spawn.js` (sembrado hacia el misil), guion de caídas |
| **I6** | EL IMPACTO del Exocet sobre el `cv` y el cierre (sin suelta); perder el misil = perder la misión | `persec.js` (fin del líder), `game.js` |
| **I7** | Textos (OK del autor), fixture, compuerta | |
