// LOS CARTELES DEL PASILLO (pedido del autor 28/9: "ENTRANDO EN RADAR — AL AGUA, ponerlo dentro de una
// caja que aparezca desde arriba, similar a la del nombre del objetivo… todos esos textos iran dentro
// de ese cuadradito; aparecen desde arriba, un par de segundos, y vuelven, por detras de la barra de
// objetivo").
//
// Eran popups sueltos flotando arriba al centro, cada uno a su altura, que se pisaban entre si y con
// el mundo. Ahora son UNA caja con el estilo de la cinta del objetivo: baja desde atras de ella, se
// queda CARTEL_QUEDA segundos y vuelve a subir. Si llegan varios juntos salen DE A UNO, en orden.
//
// Vive en core/ porque lo escriben el orquestador y varios sistemas (flight, caza, damage, persec) y
// lo lee el HUD, que no puede importar sistemas. El store se MUTA, nunca se reasigna. El reloj es de
// PARED (performance.now): un cartel no tiene que durar el triple en la camara lenta del MOMENTUM.
// …Y DESDE EL 8/10 SE APILAN (el autor: "si viene otro mensaje, empuja al anterior hacia abajo"): ya no
// esperan turno. El nuevo entra arriba, debajo de la cinta, y los que estaban bajan un lugar; cada
// uno cumple su propio reloj. Hay ademas carteles SOSTENIDOS (`cartelSostenido`): quedan mientras
// dure lo que avisan (el PELIGRO del roce) y se van cuando se termina.
export const carteles = { vivos: [] };
export const CARTEL_ENTRA = 0.22, CARTEL_QUEDA = 2.2, CARTEL_SALE = 0.28;
const DUR = CARTEL_ENTRA + CARTEL_QUEDA + CARTEL_SALE;
const TOPE = 3;
const SOLTAR_T = 1;   // lo que queda un sostenido despues de apagarse   // cuantos a la vez: el cuarto empuja afuera al mas viejo

/** Apila un cartel arriba: `txt` el texto, `col` su color, `sub` una segunda linea (o nada). El mismo
 *  texto ya en pantalla no se repite: se renueva su reloj.
 *
 *  `o.alerta`: el cartel late en su color, lleva el borde doble y flechas a los costados que titilan,
 *  y la segunda linea va grande y en `o.subCol` (el desenlace de la suelta, el PELIGRO). */
export function cartel(txt, col, sub, o) {
  if (!txt) return;
  const v = carteles.vivos;
  const ya = v.find(x => x.txt === txt && x.sub === (sub || null) && !x.id);
  if (ya) { ya.t0 = -1; return; }
  v.unshift({ txt, col: col || null, sub: sub || null, alerta: !!(o && o.alerta), subCol: (o && o.subCol) || null, t0: -1, id: null, y: null });
  while (v.length > TOPE) v.pop();
}

/** Un cartel SOSTENIDO, identificado por `id`: aparece cuando `on` se prende y se queda arriba de la
 *  pila mientras siga prendido; al apagarse hace su salida. Se llama TODOS los cuadros. */
export function cartelSostenido(id, on, txt, col, o, sub) {
  const v = carteles.vivos, ya = v.find(x => x.id === id);
  if (on) {
    if (ya) { ya.sostenido = true; return; }
    v.unshift({ txt, col: col || null, sub: sub || null, alerta: !!(o && o.alerta), subCol: (o && o.subCol) || null, t0: -1, id, sostenido: true, y: null });
    while (v.length > TOPE) v.pop();
  } else if (ya && ya.sostenido) { ya.sostenido = false; ya.soltar = true; }
}

/** Una vez por cuadro (game.js), con el reloj de pared en segundos: arranca los nuevos y saca los
 *  que cumplieron. Un sostenido no avanza su reloj mientras siga prendido. */
export function tickCarteles(now) {
  const v = carteles.vivos;
  for (const c of v) {
    if (c.t0 < 0) c.t0 = now;
    // SE APAGO LO QUE AVISABA: queda SOLTAR_T y sale (8/10, el autor: "debe salir al segundo de no
    // estar mas en peligro") — no los 2,2 s de un cartel comun
    if (c.soltar) { c.soltar = false; c.t0 = now - (DUR - CARTEL_SALE - SOLTAR_T); }
    if (c.sostenido && now - c.t0 > CARTEL_ENTRA) c.t0 = now - CARTEL_ENTRA;   // quieto, del todo afuera
  }
  for (let i = v.length - 1; i >= 0; i--) if (!v[i].sostenido && now - v[i].t0 >= DUR) v.splice(i, 1);
}

/** Los carteles que se ven ahora, de arriba hacia abajo, cada uno con cuanto esta afuera (0..1).
 *  Lo lee el HUD, que los apila. */
export function cartelesAhora(now) {
  return carteles.vivos.filter(c => c.t0 >= 0).map(c => {
    const t = now - c.t0;
    const k = t < CARTEL_ENTRA ? t / CARTEL_ENTRA : !c.sostenido && t > DUR - CARTEL_SALE ? Math.max(0, (DUR - t) / CARTEL_SALE) : 1;
    return { c, k: 1 - (1 - k) * (1 - k) };   // frena al llegar
  });
}

export function limpiarCarteles() { carteles.vivos.length = 0; }
