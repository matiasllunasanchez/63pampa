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
import { ctx, px, W, H, menuFont, rotuloFont, rotuloChicoFont } from './ctx.js';

const ESTILOS = {
  fuego: {
    stops: [[0, '#fff6a8'], [0.28, '#ffd02c'], [0.6, '#f27a18'], [1, '#b41d0c']],
    borde: '#1c0804', filo: '#701408',
    estela: ['#fff6a8', '#f7a020'],   // las rayas de viento del rotulo que vuela, en su color
  },
  hielo: {
    stops: [[0, '#ffffff'], [0.46, '#eef4ff'], [0.54, '#a8c6ff'], [1, '#3a66dc']],
    borde: '#0a1034', filo: '#223a94',
    estela: ['#ffffff', '#a8c6ff'],
  },
  // EL DE "LE DISTE! ESCAPA YA!" (autor, 7/10: "un texto similar a RASANTE, de otro color"): el
  // verde de la señal de soltar (la flecha `verde` de abajo), de claro a oscuro, con su filo.
  verde: {
    stops: [[0, '#f0ffe8'], [0.3, '#b6f5a4'], [0.62, '#4fbf52'], [1, '#1f6e2a']],
    borde: '#0b2410', filo: '#14501c',
    estela: ['#e6ffd8', '#7fe07a'],
  },
  // EL "¡ESCAPÁ YA!" (autor, 7/10: "y luego ESCAPÁ YA!, en rojo"): rojo de alarma, de claro a oscuro
  rojo: {
    stops: [[0, '#ffe2d8'], [0.3, '#ff8a70'], [0.62, '#e8321e'], [1, '#8c0e08']],
    borde: '#240402', filo: '#5c0a06',
    estela: ['#ffd0c4', '#ff6a50'],
  },
  // EL "¡MUY LARGA! ¡FALLASTE!" (autor, 7/10: "como el LE DISTE pero en gris, mas chico"): acero,
  // de claro a oscuro, sin color — el que no le pego no se lleva un color de premio ni de alarma
  gris: {
    stops: [[0, '#f4f5f6'], [0.32, '#c9ced3'], [0.64, '#8b939b'], [1, '#4c535a']],
    borde: '#101315', filo: '#2c3136',
    estela: ['#e8eaec', '#a4abb2'],
  },
  // LAS LINEAS CHICAS del nombre del avion (autor, 27/9: "en blanco"): relleno liso, con el mismo
  // contorno casi negro del fuego para que se despeguen del cielo y del agua.
  blanco: {
    stops: [[0, '#ffffff'], [1, '#ffffff']],
    borde: '#1c0804', filo: '#1c0804',
    estela: ['#ffffff', '#ffffff'],
  },
};

const CACHE = new Map();

/** El canvas con la palabra ya pintada. La llave lleva la FUENTE resuelta: mientras la tipografia
 *  no cargo, `menuFont` devuelve el monospace de respaldo, y cuando carga se re-hornea sola.
 *
 *  OTFLAG SANS EN NEGRITA (23/9, "algo mas BOLD"): la del logo (Kirana) es la version LIGHT y el
 *  rotulo se leia fino al lado de la referencia. De las del banco es la sans mas pesada y ancha;
 *  Gomarice tambien es gruesa pero angosta, y a este tamaño las letras se pegaban.
 *  (Desde el 27/9 el rotulo que VUELA va en Airborne GP —`fuente`—; OtflagSans queda para el resto.) */
/** El contorno grueso, y el margen que lleva el canvas horneado a cada lado de la letra. */
const borde = tam => Math.max(3, Math.round(tam * 0.26));
const padDe = tam => borde(tam) + 2;
/** Media altura de las MAYUSCULAS en fraccion del tamaño (con textBaseline 'middle'), y el aire
 *  entre el nombre del avion y el piloto de abajo. */
const CAJA = 0.36, SUB_AIRE = 2;

function hornear(txt, estilo, tam, fuente) {
  const font = (fuente || menuFont)(tam);
  const key = txt + '|' + estilo + '|' + font;
  let c = CACHE.get(key);
  if (c) return c;
  const e = ESTILOS[estilo] || ESTILOS.fuego;
  c = document.createElement('canvas');
  const g = c.getContext('2d');
  g.font = font;
  const grueso = borde(tam);
  const pad = padDe(tam);
  c.width = Math.ceil(g.measureText(txt).width) + pad * 2;
  c.height = Math.ceil(tam * 1.25) + pad * 2;
  g.font = font; g.textBaseline = 'middle'; g.textAlign = 'center'; g.lineJoin = 'round';
  const cx = c.width / 2, cy = c.height / 2;
  // EL CONTORNO, de afuera hacia adentro: el grueso casi negro y un filo del color del estilo.
  g.lineWidth = grueso; g.strokeStyle = e.borde; g.strokeText(txt, cx, cy);
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
/** El NOMBRE DEL AVION que entra: la mitad que RASANTE (autor, 27/9) — es un nombre, no un poder. */
export const ROTULO_NOMBRE = 15;
/** El tamaño del ¡LE DISTE! / ¡ESCAPÁ YA! (autor, 7/10: "mas chico el texto"). */
export const ROTULO_ESCAPE = 20;
/** …y el ¡MUY LARGA! / ¡FALLASTE!, mas chico todavia (autor, 7/10). */
export const ROTULO_FALLO = 16;
const ROTULO_SUB = 12;   // las lineas chicas de arriba y abajo ("Toma el mando" / el piloto)

/** Un cuadro del rotulo, `t` segundos despues de que arranco (reloj de pared: la camara lenta no
 *  lo estira). Fuera de [0, ROTULO_T] no dibuja nada. `estilo`: 'hielo' (RASANTE, el default) o
 *  'fuego' (el NOMBRE DEL AVION que entra en un cambio de piloto, 27/9 — la letra del "54" de la
 *  referencia de Metal Slug que mando el autor). `sub`: una linea CHICA debajo, que vuela pegada
 *  a la palabra (el nombre del piloto). `sobre`: otra igual ARRIBA ("Toma el mando"). Las dos en
 *  Josefin Sans (autor, 27/9): el nombre grita en la de carrera, lo que lo rodea se lee tranquilo. */
export function drawRotuloVuelo(txt, t, estilo, sub, sobre, tamano) {
  if (!(t >= 0 && t <= ROTULO_T)) return;
  const est = ESTILOS[estilo] ? estilo : 'hielo';
  // en AIRBORNE GP (27/9, pedido del autor): la letra de carrera es la del rotulo que vuela
  const tam = tamano || ROTULO_TAM;
  const c = hornear(txt, est, tam, rotuloFont), w = c.width, h = c.height;
  const [e1, e2] = ESTILOS[est].estela;
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
      px(x + w * 0.42 + (i % 3) * 6, y - h * 0.3 + i * h * 0.1, largo, 1, i % 2 ? e2 : e1);
    }
    ctx.globalAlpha = 1;
  }
  // …y la INCLINACION: la parte de arriba adelantada mientras se mueve, como un avion que acelera
  ctx.save();
  ctx.translate(x, y); ctx.transform(1, 0, -0.32 * v, 1, 0, 0); ctx.scale(pop, pop);
  const sm = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(c, -Math.round(w / 2), -Math.round(h / 2));
  // EN BLANCO (autor, 27/9). `sobre` va alineado al borde IZQUIERDO de la letra del nombre, no del
  // canvas horneado (que lleva `pad` de contorno). Hoy no se usa: el autor oculto "Toma el mando".
  const dPad = padDe(tam) - padDe(ROTULO_SUB);
  if (sobre) {
    const cs = hornear(sobre, 'blanco', ROTULO_SUB, rotuloChicoFont);
    ctx.drawImage(cs, Math.round(-w / 2 + dPad), Math.round(-h / 2 - cs.height * 0.75));
  }
  // EL PILOTO, CENTRADO Y PEGADO AL NOMBRE (autor, 27/9: "achiquemos el espacio"). Se mide de
  // letra a letra y no de canvas a canvas —los dos llevan margen de contorno—: el pie de las
  // mayusculas del nombre (media altura de caja + medio contorno) y la cabeza de las del piloto,
  // con SUB_AIRE pixeles de mundo entre medio.
  if (sub) {
    const cs = hornear(sub, 'blanco', ROTULO_SUB, rotuloChicoFont);
    const pie = tam * CAJA + borde(tam) / 2;
    const cabeza = cs.height / 2 - ROTULO_SUB * CAJA - borde(ROTULO_SUB) / 2;
    ctx.drawImage(cs, -Math.round(cs.width / 2), Math.round(pie + SUB_AIRE - cabeza));
  }
  ctx.imageSmoothingEnabled = sm;
  ctx.restore();
}

/** LA FLECHA DEL "IN ▼", apuntando abajo a (cx, puntaY). Forma de la referencia —ancha arriba, en
 *  punta abajo, con contorno— y color del estilo `fuego`: contorno casi negro y el relleno en el
 *  degrade amarillo → rojo, fila por fila. `u` es el tamaño del pixel (en pixeles de mundo). */
export function flechaIn(cx, puntaY, u, verde, dir) {
  const k = u || 1, d = dir < 0 ? -1 : 1;
  const F = ['KKKKKKKKKKK', 'K111111111K', 'K222222222K', '.K3333333K.', '..K44444K..', '...K555K...', '....K5K....', '.....K.....'];
  // `verde`: EL MOMENTO DE SOLTAR (LA SUELTA). La misma flecha en el verde de la señal, con su
  // degrade de claro a oscuro, para que lata junto con el tablero.
  // `verde === 'blanco'`: LA DE METAL SLUG (autor, 4/10: "la flecha que indica la Chancha, mas clara,
  // como la de Metal Slug, blanca") — blanca con el filo oscuro, que se lee sobre cualquier cielo.
  const COL = verde === 'blanco'
    ? { K: '#14181d', 1: '#ffffff', 2: '#f4f6f8', 3: '#e2e6ea', 4: '#c9cfd6', 5: '#aab2bc' }
    : verde
    ? { K: '#0b2410', 1: '#e6ffd8', 2: '#b6f5a4', 3: '#7fe07a', 4: '#4fbf52', 5: '#2e8f3a' }
    : { K: '#1c0804', 1: '#fff6a8', 2: '#ffd02c', 3: '#f7a020', 4: '#f27a18', 5: '#c8300f' };
  // `dir`: 1 (default) la de siempre — ancha arriba, punta abajo, o sea APUNTANDO HACIA ABAJO.
  // -1 la misma dada vuelta fila por fila: punta arriba, cuerpo abajo. El dibujo es UNO solo y se
  // lee al reves; tener dos matrices era garantizar que el dia que una cambie, la otra no.
  // En los dos casos `puntaY` es la PUNTA, que es lo que se quiere alinear con algo.
  const w = F[0].length, x0 = Math.round(cx - (w * k) / 2);
  const y0 = d > 0 ? Math.round(puntaY - F.length * k + k) : Math.round(puntaY);
  for (let j = 0; j < F.length; j++) {
    const fila = F[d > 0 ? j : F.length - 1 - j];
    for (let i = 0; i < w; i++) {
      const ch = fila[i];
      if (ch !== '.') px(x0 + i * k, y0 + j * k, k, k, COL[ch]);
    }
  }
}
