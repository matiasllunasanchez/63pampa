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
export const carteles = { cola: [], t0: -1 };
export const CARTEL_ENTRA = 0.22, CARTEL_QUEDA = 2.2, CARTEL_SALE = 0.28;
const DUR = CARTEL_ENTRA + CARTEL_QUEDA + CARTEL_SALE;
const TOPE = 4;   // si se amontonan, se descartan los del medio: el que esta y el ultimo quedan

/** Encola un cartel: `txt` el texto, `col` su color, `sub` una segunda linea (o nada). El mismo
 *  texto ya en la cola no se repite. */
export function cartel(txt, col, sub) {
  if (!txt) return;
  const c = carteles.cola;
  if (c.some(x => x.txt === txt && x.sub === (sub || null))) return;
  c.push({ txt, col: col || null, sub: sub || null });
  while (c.length > TOPE) c.splice(1, 1);
}

/** Una vez por cuadro (game.js), con el reloj de pared en segundos: termina el que vencio y arranca
 *  el siguiente. */
export function tickCarteles(now) {
  const c = carteles.cola;
  if (!c.length) { carteles.t0 = -1; return; }
  if (carteles.t0 < 0) carteles.t0 = now;
  if (now - carteles.t0 >= DUR) { c.shift(); carteles.t0 = c.length ? now : -1; }
}

/** El cartel que se ve ahora y cuanto esta afuera (0 = escondido atras de la cinta, 1 = abajo del
 *  todo), o null. Lo lee el HUD. */
export function cartelAhora(now) {
  const c = carteles.cola[0];
  if (!c || carteles.t0 < 0) return null;
  const t = now - carteles.t0;
  const k = t < CARTEL_ENTRA ? t / CARTEL_ENTRA : t > DUR - CARTEL_SALE ? Math.max(0, (DUR - t) / CARTEL_SALE) : 1;
  return { c, k: 1 - (1 - k) * (1 - k) };   // frena al llegar
}

export function limpiarCarteles() { carteles.cola.length = 0; carteles.t0 = -1; }
