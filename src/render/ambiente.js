// EL FONDO ALREDEDOR DEL JUEGO (pedido del autor, 3/10/2026: "rellenar el fondo negro de alguna
// manera"; y despues "dejalo como opcion: NEGRO, ESTE, FICHIN").
//
// Desde que el juego crece a ESCALA ENTERA (ver `ajustarEscala` en ctx.js), en una ventana que no
// es multiplo exacto del buffer queda un marco alrededor — en la ventana de 1280x720 de Electron,
// el juego ocupa 960x540 y el resto es negro. OPCIONES -> FONDO elige con que se llena:
//
//   negro       el de siempre.
//   resplandor  EL PROPIO JUEGO: una copia chiquita del canvas, estirada a toda la ventana,
//               borroneada y oscurecida por CSS (#ambiente en styles.css). Es el "modo ambiente" de
//               los televisores: el borde toma el color de lo que pasa — azul con el mar, naranja
//               con una explosion, negro en los fundidos.
//   fichin      el juego adentro de un gabinete de arcade de los 90 (assets/ui/fondo_fichin.jpg,
//               la imagen del autor), y ES EL DE FABRICA. La imagen CUBRE la ventana entera y el
//               juego se hace del tamaño de su PANTALLA, un tubo negro medido a mano en la imagen
//               (FICHIN) — ctx.js, `setAreaJuego`. El tubo es mas cuadrado que 16:9: quedan bandas
//               negras arriba y abajo, adentro del vidrio, como en un CRT de verdad. Encima va el
//               resplandor chico, como luz del juego sobre el marco (ver styles.css).
//
// EL RESPLANDOR ES BARATO A PROPOSITO. No corre en el bucle del juego: un reloj propio a AMB_HZ
// copia el canvas grande a uno de AMB_W x AMB_H en DOS pasos (achicar 960 -> 32 de un saque con
// suavizado bilineal toma pocas muestras y titila; pasando por uno intermedio promedia de verdad).
// Y no reemplaza la imagen: la MEZCLA con la anterior (AMB_MEZCLA), asi un cambio brusco —un corte
// a negro, un fogonazo— se funde en el borde en vez de parpadear al ritmo del reloj. Con otro fondo
// elegido el reloj no existe.
//
// Sin #ambiente en la pagina (el build web viejo, una herramienta) no hace nada.
import { cv, setAreaJuego } from './ctx.js';

export const FONDOS = ['negro', 'resplandor', 'fichin'];

const AMB_W = 32, AMB_H = 18;     // la copia final: la estira el CSS y el blur se come los pixeles
const MID_W = 120, MID_H = 68;    // el paso intermedio de la reduccion
const AMB_HZ = 15;                // copias por segundo
const AMB_MEZCLA = 0.3;           // cuanto pesa cada copia nueva sobre la acumulada
/** LA IMAGEN DEL GABINETE, medida en sus propios pixeles (3/10, leyendo la imagen: el negro del
 *  tubo va de x 366 a 1006 y de y 137 a 529, con las esquinas redondeadas). `ancho` es el del juego
 *  adentro — un poco menos que el tubo, para que las esquinas del juego no muerdan la curva — y
 *  (cx, cy) el centro del tubo. */
const FICHIN = { W: 1376, H: 768, ancho: 600, cx: 686, cy: 333 };
/** LOS TRES ACERCAMIENTOS (autor, 3/10): `k` cuanto se acerca la camara sobre lo que ya cubre la
 *  ventana, y `abajo` hasta que fila de la imagen llega el borde de abajo de la pantalla. 1 es el
 *  gabinete entero; 2 corta a la mitad de las manos y el juego crece; 3, un poco mas. El tubo queda
 *  arriba del centro a proposito: abajo estan los mandos, que es lo que dice "esto es un fichin". */
const ZOOM = { 1: { k: 1, abajo: 768 }, 2: { k: 1.25, abajo: 670 }, 3: { k: 1.5, abajo: 615 } };
export const ZOOMS = [1, 2, 3];
let zoom = 2;
/** Cuanto se sale la luz del juego por cada lado en el FICHIN, en fraccion del juego. */
const LUZ_SALE = 0.22;

let reloj = null, fondo = 'negro', observado = false;

/** Copia el juego al resplandor, mezclando con lo que ya habia. */
function copiar(g, gm, mid, primera) {
  if (document.hidden) return;
  gm.drawImage(cv, 0, 0, MID_W, MID_H);
  g.globalAlpha = primera ? 1 : AMB_MEZCLA;
  g.drawImage(mid, 0, 0, AMB_W, AMB_H);
}

function prenderResplandor() {
  if (reloj) return;
  const c = document.querySelector('#ambiente canvas');
  if (!c || !cv) return;
  c.width = AMB_W; c.height = AMB_H;
  const g = c.getContext('2d');
  const mid = document.createElement('canvas');
  mid.width = MID_W; mid.height = MID_H;
  const gm = mid.getContext('2d');
  g.imageSmoothingEnabled = true; gm.imageSmoothingEnabled = true;
  copiar(g, gm, mid, true);
  reloj = setInterval(() => copiar(g, gm, mid, false), 1000 / AMB_HZ);
}

function apagarResplandor() {
  if (reloj) { clearInterval(reloj); reloj = null; }
}

/** Cuanto lugar tiene el juego adentro del tubo, con el gabinete entero metido en la ventana. */
/** EL GABINETE MANDA (autor, 3/10: "deberia ocupar el 100% de la pantalla"): la imagen CUBRE la
 *  ventana entera —se recorta lo que sobre por un lado, nunca queda un borde— y el juego se hace
 *  del tamaño del tubo, sea el numero que sea. Es la unica forma en que el juego NO va a escala
 *  entera: adentro del fichin, el que pone la medida es el mueble. Devuelve la escala de la imagen,
 *  su esquina y la caja del juego, todo en px CSS. */
function geoFichin() {
  const iw = window.innerWidth, ih = window.innerHeight, z = ZOOM[zoom] || ZOOM[1];
  const s = Math.max(iw / FICHIN.W, ih / FICHIN.H) * z.k;
  // centrada en el tubo a lo ancho y apoyada en `abajo`; y en ningun caso deja ver fuera de la imagen
  const x0 = Math.min(0, Math.max(iw - FICHIN.W * s, iw / 2 - FICHIN.cx * s));
  const y0 = Math.min(0, Math.max(ih - FICHIN.H * s, ih - z.abajo * s));
  const w = FICHIN.ancho * s, h = w * 9 / 16;
  return { s, x0, y0, w, h, x: x0 + FICHIN.cx * s - w / 2, y: y0 + FICHIN.cy * s - h / 2 };
}
function areaFichin() { const g = geoFichin(); return { w: g.w, h: g.h, exacta: true }; }

/** Escala y corre la imagen para que el tubo rodee al juego (se llama en cada cambio de tamaño). */
function calzarFichin() {
  const f = document.getElementById('fichin'), stage = cv && cv.parentElement;
  if (!f || !stage || fondo !== 'fichin') return;
  const g = geoFichin();
  f.style.width = FICHIN.W * g.s + 'px'; f.style.height = FICHIN.H * g.s + 'px';
  f.style.left = g.x0 + 'px'; f.style.top = g.y0 + 'px';
  // el juego, clavado en el tubo (styles.css lo saca del flujo en este modo; el ancho lo pone
  // ajustarEscala con areaFichin, y el alto sale del aspect-ratio)
  stage.style.left = g.x + 'px'; stage.style.top = g.y + 'px';
  const r = { left: g.x, top: g.y, width: g.w, height: g.h };
  // LA LUZ DEL JUEGO (el resplandor en modo ambilight, ver styles.css): sobre el juego y LUZ_SALE
  // de mas por lado, que es hasta donde llega a teñir el marco del monitor
  const a = document.getElementById('ambiente');
  if (a) {
    const mx = r.width * LUZ_SALE, my = r.height * LUZ_SALE;
    a.style.left = (r.left - mx) + 'px'; a.style.top = (r.top - my) + 'px';
    a.style.width = (r.width + mx * 2) + 'px'; a.style.height = (r.height + my * 2) + 'px';
  }
}

/** Devuelve el resplandor a la ventana entera y el juego a su lugar (sale del modo FICHIN). */
function soltarLuz() {
  const a = document.getElementById('ambiente');
  if (a) a.style.left = a.style.top = a.style.width = a.style.height = '';
  const stage = cv && cv.parentElement;
  if (stage) stage.style.left = stage.style.top = '';
}

/** El acercamiento del FICHIN (uno de ZOOMS). Lo llama la fila de OPCIONES. */
export function setZoomFichin(n) {
  zoom = ZOOM[n] ? n : 1;
  if (fondo === 'fichin') { setAreaJuego(areaFichin); calzarFichin(); }
}

/** Pone el fondo `modo` (uno de FONDOS). Lo llaman la fila de OPCIONES y el arranque. */
export function setFondo(modo) {
  if (typeof document === 'undefined' || !document.body) return;
  fondo = FONDOS.includes(modo) ? modo : 'negro';
  for (const m of FONDOS) document.body.classList.toggle('fondo-' + m, m === fondo);
  // el resplandor corre tambien en el FICHIN: ahi es la luz del juego sobre el gabinete
  if (fondo === 'resplandor' || fondo === 'fichin') prenderResplandor(); else apagarResplandor();
  if (fondo !== 'fichin') soltarLuz();
  // el tamaño del juego depende del fondo: adentro del gabinete manda su pantalla, si no la ventana
  setAreaJuego(fondo === 'fichin' ? areaFichin : null);
  if (fondo === 'fichin') {
    if (!observado && window.ResizeObserver && cv && cv.parentElement) {
      observado = true;
      window.addEventListener('resize', calzarFichin);
    }
    calzarFichin();
  }
}
