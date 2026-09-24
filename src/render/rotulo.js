// LAS LETRAS DE ARCADE — rotulos grandes con relleno en degrade y contorno grueso.
//
// Referencia del autor (23/9/2026): el "MISSION 1 COMPLETE!" y el "IN ▼" de un arcade de los
// noventa (docs/produccion/REFERENCIAS_ARCADE.md). Dos estilos, uno por referencia:
//   fuego  amarillo arriba, naranja al medio, rojo abajo, contorno casi negro — el del MISSION
//          COMPLETE. Es el de la flecha que marca el blanco.
//   hielo  blanco arriba y azul abajo, contorno azul noche — el del IN. Es el del rotulo que pasa
//          volando (RASANTE). Los dos estaban al reves hasta que el autor los invirtio (23/9).
//
// SE HORNEA UNA VEZ por palabra, estilo y tamaño en un canvas aparte, a la resolucion del MUNDO
// (480x270) y no a la del buffer: al pintarlo con el suavizado apagado el buffer 2x lo agranda en
// pixeles gordos, que es lo que hace que se lea como arcade y no como una tipografia de sistema.
import { ctx, px, W, H, menuFont } from './ctx.js';

const ESTILOS = {
  fuego: {
    stops: [[0, '#fff6a8'], [0.28, '#ffd02c'], [0.6, '#f27a18'], [1, '#b41d0c']],
    borde: '#1c0804', filo: '#701408',
  },
  hielo: {
    stops: [[0, '#ffffff'], [0.46, '#eef4ff'], [0.54, '#a8c6ff'], [1, '#3a66dc']],
    borde: '#0a1034', filo: '#223a94',
  },
};

const CACHE = new Map();

/** El canvas con la palabra ya pintada. La llave lleva la FUENTE resuelta: mientras la tipografia
 *  no cargo, `menuFont` devuelve el monospace de respaldo, y cuando carga se re-hornea sola.
 *
 *  OTFLAG SANS EN NEGRITA (23/9, "algo mas BOLD"): la del logo (Kirana) es la version LIGHT y el
 *  rotulo se leia fino al lado de la referencia. De las del banco es la sans mas pesada y ancha;
 *  Gomarice tambien es gruesa pero angosta, y a este tamaño las letras se pegaban. */
function hornear(txt, estilo, tam) {
  const font = menuFont(tam);
  const key = txt + '|' + estilo + '|' + font;
  let c = CACHE.get(key);
  if (c) return c;
  const e = ESTILOS[estilo] || ESTILOS.fuego;
  c = document.createElement('canvas');
  const g = c.getContext('2d');
  g.font = font;
  const borde = Math.max(3, Math.round(tam * 0.26));
  const pad = borde + 2;
  c.width = Math.ceil(g.measureText(txt).width) + pad * 2;
  c.height = Math.ceil(tam * 1.25) + pad * 2;
  g.font = font; g.textBaseline = 'middle'; g.textAlign = 'center'; g.lineJoin = 'round';
  const cx = c.width / 2, cy = c.height / 2;
  // EL CONTORNO, de afuera hacia adentro: el grueso casi negro y un filo del color del estilo.
  g.lineWidth = borde; g.strokeStyle = e.borde; g.strokeText(txt, cx, cy);
  g.lineWidth = Math.max(1, Math.round(tam * 0.1)); g.strokeStyle = e.filo; g.strokeText(txt, cx, cy);
  // EL RELLENO, en degrade vertical sobre el alto de las letras.
  const gr = g.createLinearGradient(0, cy - tam * 0.5, 0, cy + tam * 0.5);
  for (const [f, col] of e.stops) gr.addColorStop(f, col);
  g.fillStyle = gr; g.fillText(txt, cx, cy);
  CACHE.set(key, c);
  return c;
}

/** Pinta `txt` centrado en (cx, cy), en coordenadas del mundo. */
export function letras(txt, estilo, tam, cx, cy, escala) {
  const c = hornear(txt, estilo, tam), k = escala || 1;
  const w = c.width * k, h = c.height * k;
  const sm = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(c, Math.round(cx - w / 2), Math.round(cy - h / 2), Math.round(w), Math.round(h));
  ctx.imageSmoothingEnabled = sm;
  return { w, h };
}

// ---------------------------------------------------------------------------------------------
// EL ROTULO QUE PASA VOLANDO (pedido del autor, 23/9): cada vez que el poder RASANTE cambia la
// camara, la palabra entra por la derecha como un avion, frena en el centro, se queda UN segundo y
// se va por la izquierda. Entra y sale inclinada hacia adelante y con estela; quieta, respira.
export const ROTULO = { ENTRA: 0.4, QUEDA: 1.0, SALE: 0.35 };
export const ROTULO_T = ROTULO.ENTRA + ROTULO.QUEDA + ROTULO.SALE;
const ROTULO_TAM = 30;

/** Un cuadro del rotulo, `t` segundos despues de que arranco (reloj de pared: la camara lenta no
 *  lo estira). Fuera de [0, ROTULO_T] no dibuja nada. */
export function drawRotuloVuelo(txt, t) {
  if (!(t >= 0 && t <= ROTULO_T)) return;
  const c = hornear(txt, 'hielo', ROTULO_TAM), w = c.width, h = c.height;
  const { ENTRA, QUEDA, SALE } = ROTULO;
  let x, v, pop = 1;
  if (t < ENTRA) {                                  // entra frenando (ease-out)
    const p = t / ENTRA, e = 1 - Math.pow(1 - p, 3);
    x = W + w / 2 + (W / 2 - W - w / 2) * e; v = (1 - p) * (1 - p);
  } else if (t < ENTRA + QUEDA) {                   // quieto: un golpe de escala al llegar
    const q = t - ENTRA;
    x = W / 2; v = 0; pop = 1 + 0.08 * Math.max(0, 1 - q / 0.14);
  } else {                                          // sale acelerando (ease-in)
    const p = (t - ENTRA - QUEDA) / SALE, e = p * p * p;
    x = W / 2 + (-w / 2 - W / 2) * e; v = p * p;
  }
  const y = Math.round(H * 0.3 + (v === 0 ? Math.sin(t * 6) : 0));
  // LA ESTELA: rayas de viento detras (a la derecha: la palabra vuela hacia la izquierda)
  if (v > 0.02) {
    for (let i = 0; i < 7; i++) {
      const largo = (40 + ((i * 37) % 60)) * v * 2.2;
      ctx.globalAlpha = 0.55 * v;
      px(x + w * 0.42 + (i % 3) * 6, y - h * 0.3 + i * h * 0.1, largo, 1, i % 2 ? '#a8c6ff' : '#ffffff');
    }
    ctx.globalAlpha = 1;
  }
  // …y la INCLINACION: la parte de arriba adelantada mientras se mueve, como un avion que acelera
  ctx.save();
  ctx.translate(x, y); ctx.transform(1, 0, -0.32 * v, 1, 0, 0); ctx.scale(pop, pop);
  const sm = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(c, -Math.round(w / 2), -Math.round(h / 2));
  ctx.imageSmoothingEnabled = sm;
  ctx.restore();
}

/** LA FLECHA DEL "IN ▼", apuntando abajo a (cx, puntaY). Forma de la referencia —ancha arriba, en
 *  punta abajo, con contorno— y color del estilo `fuego`: contorno casi negro y el relleno en el
 *  degrade amarillo → rojo, fila por fila. `u` es el tamaño del pixel (en pixeles de mundo). */
export function flechaIn(cx, puntaY, u, verde) {
  const k = u || 1;
  const F = ['KKKKKKKKKKK', 'K111111111K', 'K222222222K', '.K3333333K.', '..K44444K..', '...K555K...', '....K5K....', '.....K.....'];
  // `verde`: EL MOMENTO DE SOLTAR (LA SUELTA). La misma flecha en el verde de la señal, con su
  // degrade de claro a oscuro, para que lata junto con el tablero.
  const COL = verde
    ? { K: '#0b2410', 1: '#e6ffd8', 2: '#b6f5a4', 3: '#7fe07a', 4: '#4fbf52', 5: '#2e8f3a' }
    : { K: '#1c0804', 1: '#fff6a8', 2: '#ffd02c', 3: '#f7a020', 4: '#f27a18', 5: '#c8300f' };
  const w = F[0].length, x0 = Math.round(cx - (w * k) / 2), y0 = Math.round(puntaY - F.length * k + k);
  for (let j = 0; j < F.length; j++) for (let i = 0; i < w; i++) {
    const ch = F[j][i];
    if (ch !== '.') px(x0 + i * k, y0 + j * k, k, k, COL[ch]);
  }
}
