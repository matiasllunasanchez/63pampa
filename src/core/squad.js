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

/** LA NAFTA DEL COMPAÑERO (25/9: "todos estan volando, pero los de atras estan ahorrando
 *  combustible y el principal es el que gasta mas y hace piruetas"). El que asume venia en la
 *  formacion a crucero economico: gasto solo RELEVO_AHORRO de lo que gasto el lider. Asi entra
 *  siempre con MAS que el que se fue —el seco (0 %) deja un compañero con 40 %—, pero nunca lleno:
 *  morir no es repostar. `fuel` es el % del lider al caer. */
export const RELEVO_AHORRO = 0.6;
export const naftaCompanero = fuel => 100 - (100 - Math.max(0, Math.min(100, fuel))) * RELEVO_AHORRO;

/** ¿Queda escuadron para relevar? Con 1 avion NO: morir es morir, igual que siempre. */
export const canRelevo = lives => lives > 1;

/** Indice (0-based) del piloto al mando: con 4 aviones y 4 vidas mandas vos (PATRIA 1);
 *  cae uno (3 vidas) y asume PATRIA 2. */
export const pilotIdx = (squad, lives) => Math.max(0, squad - lives);

// ---------- LA FILA: QUIEN VUELA, CON CAMBIO DE PILOTO (pedido del autor, 26/9/2026) ----------
// "Necesito una mecanica que me permita cambiar de piloto a demanda, ir switcheando al siguiente,
// encendible o apagable. Viene un avion desde atras y cambia lugar con el del jugador, que pasa
// atras." Hasta hoy el que vuela SALIA de las vidas — `pilotIdx`: los caidos son los numerales de
// abajo y manda el primero vivo—, y eso no admite que PATRIA 3 vuele mientras PATRIA 2 espera.
//
// `r.orden` es la FILA: los numerales vivos en el orden en que van, y el PRIMERO vuela. Cambiar es
// mandar al primero al fondo; caer es sacarlo. CON LA MECANICA APAGADA la fila nunca se reordena, y
// quedar siempre en orden ascendente con los caidos sacados de adelante es EXACTAMENTE `pilotIdx`
// — las dos funciones de abajo devuelven los mismos numeros que antes, hasta el ultimo cuadro.
// Sin fila (un `run` viejo, una sonda) caen a la cuenta de siempre.

/** ¿La fila dice la verdad? Tiene que tener un numeral por avion vivo. Las sondas escriben
 *  `run.lives` a mano (`__vidas`, `__qlives`…) y una fila que no se entero de eso contaria pilotos
 *  que no existen; con esto, la fila desincronizada simplemente no se usa. */
export const filaOk = r => !!(r.orden && r.orden.length && r.orden.length === r.lives);
/** La fila que corresponde a la cuenta de vidas de siempre: los vivos, en orden. */
export const filaDeVidas = (squad, lives) => Array.from({ length: Math.max(0, lives) }, (_, i) => pilotIdx(squad, lives) + i);

/** El numeral que vuela ahora. */
export const alMando = r => (filaOk(r) ? r.orden[0] : pilotIdx(r.squad, r.lives));
/** El que va `k` puestos detras en la fila (1 = el que entraria si cambias o si caes). */
export const detras = (r, k = 1) => (filaOk(r) && r.orden.length > k ? r.orden[k] : pilotIdx(r.squad, r.lives) + k);

// EL CAMBIO ES INSTANTANEO (pedido del autor, 26/9: "en cada cambio no quiero que se vea la
// cinematica del avion dañado, sino que simplemente cambia"). La primera version tenia una maniobra
// —el que se iba caia hacia la camara banqueando y el nuevo entraba desde atras— y se leia como el
// relevo de un avion roto. Ahora cambian la cara, el nombre y la ficha en el mismo cuadro.
//   CAMBIO_CD  la espera entre cambios. Sin ella la tecla se volveria un boton de refrescar la
//              ficha cada cuadro.
export const CAMBIO_CD = 3;

// EL QUE ENTRA VIENE DESDE ATRAS (pedido del autor, 27/9: "que aparezca desde atras, no de arriba").
// Atras, con esta camara, es MAS CERCA de la camara: arranca detras de ella —sin verse—, asoma
// grande y abajo, y avanza frenando hasta su puesto. Es un corrimiento de profundidad SOLO DE DIBUJO
// (render/plane.js, `dz`): la fisica del avion sigue en su plano.
//   CAMBIO_DZ     cuanto mas cerca de la camara arranca (PZ 14 - 12 = 2: detras de ella)
//   CAMBIO_LLEGA  segundos que tarda en llegar, contados desde que termina el primer tiempo
export const CAMBIO_DZ = 12, CAMBIO_LLEGA = 1.4;
/** El `dz` del que entra a los `t` segundos de la cinematica (reloj del relevo): -CAMBIO_DZ durante
 *  el primer tiempo —escondido, mientras se ve irse al tuyo— y despues hasta 0, frenando al llegar. */
export function cambioEntraDz(t) {
  const u = Math.max(0, Math.min(1, (t - RELEVO_WRECK) / CAMBIO_LLEGA));
  const e = 1 - (1 - u) * (1 - u);
  return u >= 1 ? 0 : -CAMBIO_DZ * (1 - e);
}

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
