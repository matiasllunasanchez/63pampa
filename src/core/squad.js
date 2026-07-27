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
