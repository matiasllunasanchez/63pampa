// LA CABINA EN PRIMERA PERSONA (docs/sistemas/PLAN_PRIMERA_PERSONA.md, F2 — 14/10/2026).
//
// La imagen la hornea Blender desde el ojo del piloto con LA MISMA proyeccion del juego (tools/blender/
// hornear_cabina.py): se dibuja tal cual, a pantalla completa y clavada — la cabina es el avion; lo que
// rola y cabecea es el mundo de atras. Al doble (960x540): el buffer del juego.
//
// Las ANCLAS (data/cabina_anclas.js) dicen donde cae cada reloj del tablero y el colimador. F3 dibuja
// ahi los relojes vivos de render/hud.js; hoy el HUD de siempre sigue encima.
//
// Sin la imagen (todavia no cargo) no se dibuja cabina: se ve el mundo y el HUD, nada se rompe.
import { ctx, cv, W, H, HOR, SC, F } from './ctx.js';
import { inp } from '../core/input.js';
import { run } from '../core/run.js';
import { CABINA_CAPAS, CABINA_ANCLAS } from '../data/cabina_anclas.js';

const IMG = new Image();
IMG.src = '../assets/planes/cabina.png';
const lista = () => IMG.complete && IMG.naturalWidth > 0;

// LAS MANOS SE MUEVEN CON EL MANDO (el autor, 15/10): la palanca con la mano derecha (3x3 poses: fila =
// picar / centro / trepar, columna = izquierda / centro / derecha) y el acelerador con la izquierda
// (freno / normal / turbo), horneados aparte (tools/blender/armar_cabina.py). Se elige la pose de lo que
// el jugador APRIETA, no del avion: es su mano.
const CAPA = {};
// (rutas literales: tools/build_web.py las ve y las saca del build web, como la base)
for (const [n, src] of [['palanca', '../assets/planes/cabina_palanca.png'], ['acelerador', '../assets/planes/cabina_acelerador.png']]) {
  CAPA[n] = new Image(); CAPA[n].src = src;
}
function drawCapa(n, fila, col) {
  const im = CAPA[n], c = CABINA_CAPAS[n];
  if (!(im.complete && im.naturalWidth && c)) return;
  ctx.drawImage(im, col * c.fw, fila * c.fh, c.fw, c.fh, c.x, c.y, c.w, c.h);
}
const signo = v => v > 0.3 ? 1 : v < -0.3 ? -1 : 0;

// LOS RELOJES DE RELLENO ANDAN (20/11, el autor: "las agujas que no tienen indicador y son solo relleno hay que
// ponerlas que se muevan, tiemblen y cada tanto bajen o suban, alguna mas fija y mas lenta y otra mas rapida"): el
// horno los deja sin aguja (hornear_cabina.py `DECO`) y aca cada uno tiene su caracter —donde descansa, cuanto tiembla,
// cada cuanto se va a otro valor y que tan rapido llega—. El 3ro es el hueco del reloj de TEMPERATURA (render/hud.js
// ANCLA_TEMP): ese no lleva aguja de relleno.
const AGUJA_C = '#d9d8cc';
const CARACTER = [
  { base: 0.20, tiembla: 0.020, cada: [3, 6], salto: 0.18, vel: 3.0 },     // el chico de la izquierda: nervioso
  { base: 0.70, tiembla: 0.015, cada: [4, 8], salto: 0.12, vel: 2.2 },
  null,                                                                     // (el de la temperatura)
  { base: 0.55, tiembla: 0.004, cada: [12, 20], salto: 0.06, vel: 0.4 },    // casi fijo y lento (la presion)
  { base: 0.35, tiembla: 0.010, cada: [6, 11], salto: 0.10, vel: 1.0 },
  { base: 0.82, tiembla: 0.030, cada: [2, 4], salto: 0.22, vel: 4.5 },      // el rapido (las RPM)
  { base: 0.12, tiembla: 0.006, cada: [9, 15], salto: 0.08, vel: 0.7 },
  { base: 0.62, tiembla: 0.012, cada: [5, 9], salto: 0.15, vel: 1.6 },
  { base: 0.40, tiembla: 0.003, cada: [15, 25], salto: 0.05, vel: 0.3 },    // el mas quieto
];
const AGUJAS = CARACTER.map(c => (c ? { v: c.base, meta: c.base, prox: c.cada[0] * Math.random() } : null));
let agujasT = null;
function drawAgujas() {
  const D = CABINA_ANCLAS.deco || [];
  const ahora = performance.now() / 1000, dt = agujasT === null ? 0 : Math.min(0.1, ahora - agujasT);
  agujasT = ahora;
  for (let i = 0; i < D.length; i++) {
    const c = CARACTER[i % CARACTER.length], a = AGUJAS[i % AGUJAS.length];
    if (!c || !a) continue;
    a.prox -= dt;
    if (a.prox <= 0) {   // cada tanto se va a otro valor (sube o baja) y despues vuelve cerca de su lugar
      a.prox = c.cada[0] + Math.random() * (c.cada[1] - c.cada[0]);
      a.meta = Math.max(0.03, Math.min(0.97, c.base + (Math.random() * 2 - 1) * c.salto));
    }
    a.v += (a.meta - a.v) * Math.min(1, dt * c.vel);
    const f = a.v + (Math.sin(ahora * 23 + i * 7) * 0.6 + Math.sin(ahora * 37 + i * 3) * 0.4) * c.tiembla;
    // la escala va de abajo a la izquierda (0) a abajo a la derecha (1), por arriba, como un reloj de verdad
    const ang = Math.PI * 0.75 + f * Math.PI * 1.5;
    const [x, y, r] = D[i], L = r * 0.78;
    ctx.strokeStyle = AGUJA_C; ctx.lineWidth = Math.max(0.8, r * 0.1); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - Math.cos(ang) * r * 0.18, y - Math.sin(ang) * r * 0.18); ctx.lineTo(x + Math.cos(ang) * L, y + Math.sin(ang) * L); ctx.stroke();
    ctx.fillStyle = '#2b3033'; ctx.beginPath(); ctx.arc(x, y, Math.max(0.8, r * 0.14), 0, Math.PI * 2); ctx.fill();
  }
  ctx.lineCap = 'butt';
}

// LOS ESPEJOS REFLEJAN (21/11, el autor: "deben reflejar lo de atras, se puede?"). No hay una camara para atras —el
// pasillo dibuja solo hacia adelante—, asi que el reflejo sale del MUNDO YA DIBUJADO: antes de poner la cabina encima
// se copia una franja vertical de ese lado, con el horizonte a la altura donde el espejo lo tiene, y se dibuja
// DADA VUELTA, un poco oscurecida (es un vidrio) y recortada con la forma del vidrio (assets/planes/cabina_espejo_*,
// horneada con la cabina). Asi el espejo cambia con el cielo, el horizonte que rola, el clima y la tierra o el mar.
const ESPEJO = {};
for (const [n, src] of [['espejo_izq', '../assets/planes/cabina_espejo_izq.png'], ['espejo_der', '../assets/planes/cabina_espejo_der.png']]) {
  ESPEJO[n] = { img: new Image(), cv: null };
  ESPEJO[n].img.src = src;
}
const ESPEJO_HOR = 0.58;   // a que altura del vidrio cae el horizonte (el mar abajo, como el horneado)
const ESPEJO_ZOOM = 1.9;   // cuanto mundo entra: la franja que se copia es este tanto mas grande que el vidrio
function copiarEspejos(atras, contactos) {
  for (const n in ESPEJO) {
    const E = ESPEJO[n], c = CABINA_CAPAS[n];
    if (!c || !(E.img.complete && E.img.naturalWidth)) { E.listo = false; continue; }
    if (!E.cv) { E.cv = document.createElement('canvas'); E.cv.width = c.fw; E.cv.height = c.fh; E.cx = E.cv.getContext('2d'); }
    const x = E.cx, tw = E.cv.width, th = E.cv.height;
    if (atras) {
      // EN LAS ISLAS, LA CAMARA DE ATRAS (systems/three-arena.js `espejo`): ya viene dada vuelta; a cada espejo su mitad
      const izq = n === 'espejo_izq', hw = atras.width / 2;
      x.save(); x.globalCompositeOperation = 'copy'; x.imageSmoothingEnabled = false;
      x.drawImage(atras, izq ? 0 : hw, 0, hw, atras.height, 0, 0, tw, th);
      x.restore();
      vidrio(E, x, tw, th);
      continue;
    }
    // la franja del mundo: del lado del espejo, mas hacia afuera (lo que queda atras y al costado)
    const sw = c.w * ESPEJO_ZOOM, sh = c.h * ESPEJO_ZOOM;
    const sx = c.x + c.w / 2 - sw / 2 + (c.x < W / 2 ? -sw * 0.6 : sw * 0.6), sy = HOR - sh * ESPEJO_HOR;
    x.save();
    x.globalCompositeOperation = 'copy'; x.imageSmoothingEnabled = false;
    x.setTransform(-1, 0, 0, 1, tw, 0);                          // dado vuelta: es un espejo
    x.drawImage(cv, Math.max(0, sx * SC), Math.max(0, sy * SC), sw * SC, sh * SC, 0, 0, tw, th);
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.restore();
    // LO QUE VIENE DE ATRAS EN EL PASILLO (los Harriers en tu cola, los misiles): no hay escena para atras, asi que
    // cada uno se pone a mano con su direccion — `contactos` = [{ l, up, d, tipo }] en metros (d = cuanto atras)
    for (const k of contactos || []) contacto(x, tw, th, k, n === 'espejo_izq');
    vidrio(E, x, tw, th);
  }
}
/** Un contacto de atras en el espejo `izq`/der. EL PASILLO ESTA COMPRIMIDO (el Harrier de la cola anda a ~6 m detras y
 *  25 m al costado): un cono de espejo de verdad no lo agarraria nunca. Asi que cada espejo cubre una FRANJA DE
 *  COSTADO —el izquierdo lo que viene por la izquierda, el derecho por la derecha, los dos lo de atras al medio— y
 *  el tamaño crece cuanto mas cerca esta. */
const ESP_LADO = 14, ESP_ANCHO = 30;   // m: el centro de la franja de cada espejo y cuanto cubre
function contacto(x, tw, th, k, izq) {
  if (!(k.d > 0.5)) return;
  const rel = (k.l - (izq ? -ESP_LADO : ESP_LADO)) / ESP_ANCHO;
  const px0 = tw / 2 + rel * tw, py0 = th * ESPEJO_HOR - (k.up / ESP_ANCHO) * tw;
  if (px0 < -8 || px0 > tw + 8 || py0 < -8 || py0 > th + 8) return;
  const L = Math.min(tw * 0.7, Math.max(3, tw * (k.tipo === 'misil' ? 3 : 9) / (k.d + 10)));
  x.save(); x.translate(px0, py0); x.rotate(-(k.bank || 0));
  if (k.tipo === 'misil') {
    // de frente: la punta clara y el humo que se abre atras de el (para arriba en el espejo no: se queda chico)
    x.fillStyle = '#e9e4d6'; x.fillRect(-L * 0.25, -L * 0.25, Math.max(1, L * 0.5), Math.max(1, L * 0.5));
    x.fillStyle = 'rgba(255,170,90,0.85)'; x.fillRect(-L * 0.12, -L * 0.12, Math.max(1, L * 0.24), Math.max(1, L * 0.24));
  } else {
    // el Harrier DE FRENTE: las alas, el fuselaje y la deriva, oscuros contra el cielo
    x.fillStyle = '#23292e';
    x.fillRect(-L / 2, -Math.max(1, L * 0.05), L, Math.max(1, L * 0.11));
    x.fillRect(-Math.max(1, L * 0.09), -Math.max(1, L * 0.12), Math.max(2, L * 0.18), Math.max(2, L * 0.22));
    x.fillRect(-Math.max(0.5, L * 0.03), -Math.max(1.5, L * 0.32), Math.max(1, L * 0.06), Math.max(1.5, L * 0.22));
  }
  x.restore();
}
function vidrio(E, x, tw, th) {
    x.save();
    // el VIDRIO: un poco mas oscuro y frio, y un brillo en diagonal
    x.fillStyle = 'rgba(18,28,38,0.22)'; x.fillRect(0, 0, tw, th);
    const g = x.createLinearGradient(0, 0, tw, th * 0.5);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.45, 'rgba(255,255,255,0.10)'); g.addColorStop(0.6, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, tw, th);
    // la FORMA del vidrio
    x.globalCompositeOperation = 'destination-in';
    x.drawImage(E.img, 0, 0, tw, th);
    x.restore();
    E.listo = true;
}
function drawEspejos() {
  for (const n in ESPEJO) {
    const E = ESPEJO[n], c = CABINA_CAPAS[n];
    if (E.listo) ctx.drawImage(E.cv, c.x, c.y, c.w, c.h);
  }
}

/** `atras` = el cuadro de la camara de atras (las islas) o null; `contactos` = lo que viene de atras en el pasillo. */
export function drawCabina(atras = null, contactos = null) {
  if (!lista()) return;
  const s = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  copiarEspejos(atras, contactos);   // (ANTES de la cabina: lo que se copia es el mundo)
  ctx.drawImage(IMG, 0, 0, W, H);
  drawEspejos();
  drawAgujas();
  drawManos();
  ctx.imageSmoothingEnabled = s;
}

/** LAS MANOS, otra vez ENCIMA de los relojes vivos (21/11, el autor: "el indicador deberia estar por detras de la
 *  mano"): render/hud.js dibuja los relojes del tablero despues de la cabina y la palanca quedaba tapada por el de
 *  abajo al medio. El HUD llama a esto al terminar el tablero. */
export function drawManos() {
  if (!lista()) return;
  const s = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  const lado = signo((inp.r - inp.l) + (inp.rollAx || 0));
  const cabeceo = signo(inp.u - inp.d);                       // + trepar = palanca atras
  drawCapa('acelerador', 0, inp.brake ? 0 : (inp.turbo || run.boost) ? 2 : 1);
  drawCapa('palanca', cabeceo + 1, lado + 1);
  ctx.imageSmoothingEnabled = s;
}
