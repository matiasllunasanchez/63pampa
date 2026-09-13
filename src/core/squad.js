// ESCUADRON: la matematica PURA de las vidas y del relevo. Cero dependencias y cero estado,
// como core/physics.js — es lo que permite testearla en node (tools/unit.js) sin canvas.
//
// El escuadron son las VIDAS del jugador, pero contadas como aviones de una formacion real:
// el jugador arranca como lider (PATRIA 1) y cada derribo lo releva el numeral siguiente.
// Quien EJECUTA el relevo es systems/squad.js; quien lo DIBUJA es render/squad.js.

// La cinematica del relevo, en dos tiempos:
//   WRECK   (0 .. RELEVO_WRECK)  la camara se queda con los restos del lider — el companero
//                                nuevo lo VE caer; cortar seco al avion nuevo mataria la escena
//   HANDOFF (.. RELEVO_DUR)      el companero entra, pasa por los restos y se asienta.
// HANDOFF dura RELEVO_GRACE: es LA MISMA ventana de 2 s de invulnerabilidad + esquive
// automatico del diseño — un solo reloj para las dos cosas, para que no puedan desfasarse.
export const RELEVO_WRECK = 1.0;
export const RELEVO_GRACE = 2.0;
export const RELEVO_DUR = RELEVO_WRECK + RELEVO_GRACE;

export const SQUAD_MIN = 1, SQUAD_MAX = 8;

/** ¿Queda escuadron para relevar? Con 1 avion NO: morir es morir, igual que siempre. */
export const canRelevo = lives => lives > 1;

/** Indice (0-based) del piloto al mando: con 4 aviones y 4 vidas mandas vos (PATRIA 1);
 *  cae uno (3 vidas) y asume PATRIA 2. */
export const pilotIdx = (squad, lives) => Math.max(0, squad - lives);

/** Indicativo radial del numeral `idx`. Es nombre propio (escuadron argentino): no se traduce. */
export const callsign = idx => 'PATRIA ' + (idx + 1);

/** Fase de la cinematica a tiempo `t`. `invuln` cubre TODO el relevo — la ventana de gracia
 *  no es un flag aparte que alguien pueda olvidarse de apagar. */
export function relevoPhase(t) {
  return {
    beat: t < RELEVO_WRECK ? 'wreck' : 'handoff',
    invuln: t < RELEVO_DUR,
    done: t >= RELEVO_DUR,
  };
}

/** Puestos de la formacion de despegue para `n` aviones (el lider no cuenta: vuela el jugador).
 *  Escalon en V alternando lados — dx/dy en unidades de mundo, dz NEGATIVO porque "detras del
 *  lider" con la camara atras significa MAS CERCA de la camara (z menor). */
export function formationSlots(n) {
  const slots = [];
  for (let i = 1; i < n; i++) {
    const side = i % 2 === 1 ? -1 : 1;
    const rank = Math.ceil(i / 2);
    slots.push({ dx: side * 5.5 * rank, dz: -1.6 * rank, dy: 0.55 * rank });
  }
  return slots;
}

/** DONDE ESTA EL COMPAÑERO `i` DE LA FORMACION, resuelto: x, y y el dz respecto del plano de
 *  camara (quien llama le suma su PZ — este archivo es `core` y no sabe de render).
 *
 *  Vive ACA y no en el render porque lo necesitan DOS: el dibujo de la formacion y el polvo que
 *  levantan al carretear (game.js). Con la cuenta copiada en los dos lados, el dia que la
 *  formacion se mueva el polvo se queda donde estaba y aparece saliendo de la nada.
 *
 *  `rank` es la fila: los de atras siguen al lider CON RETRASO —rotan mas tarde— que es la
 *  escalera de ascenso que se ve en cualquier despegue en formacion. El seno es el bob de "vuelo
 *  vivo", distinto por puesto para que no respiren todos juntos. */
export function puestoFormacion(slots, i, px, py, t) {
  const sl = slots[i], rank = Math.ceil((i + 1) / 2);
  return {
    x: px + sl.dx,
    y: Math.max(0.8, py - rank * 1.7) + Math.sin(t * 2.6 + i * 1.9) * 0.25,
    dz: sl.dz,
    rank,
  };
}
