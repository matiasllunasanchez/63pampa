// EL RECIBIMIENTO — el estado (pedido del autor, 4/10: "llegando a cualquier objetivo me tienen que
// disparar con metralletas pero que le erren… para darle efecto de adrenalina").
//
// PURA DECORACION: no hay colision, no hay daño, no hay nada que esquivar. Las balas salen del buque
// con su fogonazo, cruzan el cielo como trazadoras y pegan en el agua (o la tierra) alrededor tuyo.
// Lo mueve systems/recibe.js y lo dibuja render/recibe.js; vive en core/ porque el render no puede
// importar sistemas (`npm run lint:layers`). Se MUTA, nunca se reasigna.
export const recibe = {
  // las trazadoras en vuelo: origen (o*) y pique (d*) en espacio de camara, y su reloj
  tiros: [],      // { ox, oy, oz, dx, dy, dz, t, T }
  // los fogonazos en el buque: donde, relativo a la eslora, y cuanto le queda
  destellos: [],  // { x, y, t }
  rafT: 0,        // reloj de la proxima rafaga
};

export function resetRecibe() {
  recibe.tiros.length = 0; recibe.destellos.length = 0; recibe.rafT = 0;
}
