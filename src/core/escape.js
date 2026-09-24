// EL ESCAPE — el estado (PLAN_VUELTA_REAL §2.B, V2 "la línea recta"; docs en data/blanco.js, ESC).
//
// En core/ por la misma razon que core/blanco.js: lo mueve systems/escape.js y lo dibuja
// render/escape.js, y el render no puede importar sistemas. Se MUTA, nunca se reasigna.
export const escape = {
  on: false,
  t: 0,            // segundos desde el cruce
  carrilX: 0,      // el eje de la linea recta: donde cruzaste el buque
  rafT: 0,         // reloj de la proxima rafaga de popa
  panza: false,    // este cuadro estas mostrando la panza (fuera del carril o alabeado)
  tiros: [],       // las trazadoras de popa: { ox, oy, ax, ay, z, zPrev, t }
  // LA VIBORA (V3): la solucion de tiro del artillero (0..1), el ultimo lado hacia el que te moviste,
  // cuanto le queda congelada por el humo, y los piques recientes (se mueven con el mundo)
  sol: 0, lado: 0, congela: 0, vibora: false,
  piques: [],      // { x, z }
};

export function resetEscape() {
  escape.on = false; escape.t = 0; escape.carrilX = 0; escape.rafT = 0; escape.panza = false;
  escape.tiros.length = 0;
  escape.sol = 0; escape.lado = 0; escape.congela = 0; escape.vibora = false; escape.piques.length = 0;
}

/** Donde esta una trazadora a la profundidad `z`. El buque quedo MUY atras (`dist` unidades), asi
 *  que el tiro viene casi paralelo al vuelo: pasa por el punto de mira (ax, ay) a la profundidad
 *  del avion con la pendiente que trae desde popa (ox, oy), y pasado el avion cae por gravedad
 *  hasta el agua. Con el origen cerca, en cambio, salia en diagonal y se iba al cielo (medido). */
export function tiroEn(tr, z, dist, pz, g) {
  const d = (z - pz) / dist;
  const caida = z > pz ? g * ((z - pz) / 100) * ((z - pz) / 100) : 0;
  return { x: tr.ax + (tr.ax - tr.ox) * d, y: tr.ay + (tr.ay - tr.oy) * d - caida };
}
