# Feedback del tutorial — 21/11/2026 (Matías, jugando)

Transcripto tal cual llegó, agrupado. `[x]` hecho el 22/11 (espera prueba del autor).

## A. Arreglos chicos (claros, sin decisión de diseño)
- [x] A1. Etapa 1: la flechita de objetivo no va.
- [x] A2. Etapa 1 no debería tener FIN: se ve de lejos la espuma/niebla que tapa al barco.
- [x] A3. "Pajarracos hecho pingo" quedó cortado.
- [x] A4. Quedó un diálogo de la etapa 2 en la etapa 3.
- [x] A5. El R3 (en el cartel BOMBA) está re chico.
- [x] A6. El instrumento dice MACH y ya es brújula.
- [x] A7. La mira de los globos/objetivos es demasiado gorda, se pierde con la mira: otro color, más fina.

## B. Tutorial: explicar mejor
- [x] B1. Antes de arrancar, mostrar el joystick (o el teclado) con qué hace cada botón.
- [x] B2. Las chafitas no se explican.
- [x] B3. Pichón explica cómo esquivar un misil: que sea claro que cuando venga un misil hay que hacer una pirueta. "Probá el tonel". El tonel: aclarar la rapidez.
- [x] B4. Rasante: que MUESTREN la barrita cuando lo explican; marcar el límite final de "perfecto".
- [x] B5. Rasante en azul: no queda claro que podés dejar de apretar (si no, otro botón para marcarlo). El tiempo de rasante debería durar más.
- [x] B6. No se explica que el indicador es la ZONA DE RADAR.
- [x] B7. La marca verde del buque: mostrarla cuando Pichón la nombra.
- [x] B8. "Ahí está el buque… la bomba tiene que caer más de un segundo…": el texto no es claro; no tenés forma de medir segundos; el cartel no debería decir BOMBA sino "recorrido de bomba" o algo así.
- [x] B9. El corchete verde CONFUNDE. No queda claro cuándo y cómo se lanza la bomba; la mira redonda se muestra en un margen muy chico. Repensar cómo se indica la altura y distancia correctas.

## C. Mecánica
- [x] C1. Momentum: que dure más y tenga dos niveles (apretar otra vez = igual de lento que ahora, pero tarda menos).
- [x] C2. Con joystick la mira gigante quizá no suma (con mouse sí): con joystick importa dónde está el avión y adónde mira de frente.
- [x] C3. Islas: los aviones DEBEN PODER COLISIONAR; si chocan mueren ambos (lo chocó un Harrier) y la IA debe intentar no chocar.
- [x] C4. Islas: la base costera la debería marcar el juego o indicarla SOLA en el mapa; no queda claro dónde está ni adónde ir.
- [x] C5. Los misiles que salen de los barcos: no queda claro adónde tiran.

## D. Mundo / fondo
- [x] D1. Olas: más variabilidad de espuma; más largas (desde muy alto se nota el ancho total); variables aunque sea relleno.
- [x] D2. Nubes: hoy parecen globos; nubes a la altura del sol también; variar alturas y cercanía al horizonte.
- [x] D3. Fondo con más vida: pájaros a lo lejos, quizá un avión; de noche estrella fugaz, algún satélite, quizá algo desconocido.

## Notas de lo hecho
- A1/A2: las etapas sin buque (objetivo LEJOS) no dibujan la cuña ni el buque con niebla (game.js `sinObjetivoVisible`).
- A3/A4: el remate espera a que la radio se calle; con la pausa de diálogo la caja de la derecha ya no guarda la línea vieja.
- A5: el gesto «stick der ↓ + R3» lleva al lado su botón R3 a tamaño entero (render/glifos.js).
- A7: el anillo de los blancos de práctica, fino y celeste.
- B1: TUT1_MANDO, la lámina del joystick o del teclado (render/mando.js).
- B2/B3: TUT2_CHAFITAS nuevo; el tonel dice "cuando venga un misil, hacé una pirueta" y "dos toques bien rápidos".
- B4/B5: la barrita del rasante dibujada en grande mientras la explican; raya naranja de PERFECTO en el altímetro; el poder dura 1,5 s por acierto (era 1).
- B6: foco en el cartel ZONA RADAR y la línea que lo explica (con las banderas).
- B7–B9: SEMÁFORO "RECORRIDO DE BOMBA" (rojo lejos/SUBÍ/BAJÁ, amarillo PREPARATE, verde ¡SOLTÁ!, TARDE); los corchetes ya no se ponen verdes; la ventana del tutorial más ancha (HOLGURA.tutorial 340 ≈ 5,8 s).
- C1: momentum en dos niveles (suave 0,6 → otro toque 0,35 → tercero corta); recarga ×0,7 y duración ×1,6.
- C2: con joystick, una marca chica al frente en vez de la mira grande.
- C3–C5 (islas): choque con Harrier (mueren los dos; la IA se abre), la base costera se pone y se marca sola (era un bug: en el tutorial no se ponía), estela y aviso de misil entrante.
- D1–D3: olas a todo lo ancho y relleno de espuma; nubes nuevas en capas (también a la altura del sol); pájaros, avión lejano, y de noche estrella fugaz, satélite y una luz rara.
