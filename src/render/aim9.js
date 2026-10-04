// EL SIDEWINDER — el dibujo (la cuenta de su vuelo es core/aim9.js; el que lo mueve es
// systems/collision.js, con los demas misiles; los numeros son AIM9 en data/tuning.js).
//
// DE LA FAMILIA DEL SEA DART, PERO SUYO (pedido del autor, 30/9/2026): "algo similar al efecto
// del Sea Dart pero mas chico, con otro color de estela (puede ser rojo) y un horneado de ESTE
// misil". Tres piezas:
//
//   · LA ESTELA ROJA. El camino entero que hizo (m.tr, en el marco del mundo: se queda en el aire y
//     el mundo se la lleva), con un halo oscuro y un nucleo rojo que se apagan con la edad. Es lo
//     que deja LEERLO: de frente, la raya que viene desde el caza; de atras, el tajo que se abre
//     hacia los bordes de la pantalla mientras se te pone en la cola.
//   · EL MISIL. De cerca, la hoja horneada (assets/ammo/aim9.png: diez vistas de cola a nariz),
//     rotada para que la nariz apunte hacia donde va. De lejos —pocos pixeles— el punto del Sea
//     Dart en chico: ojiva oscura, corona que late y nucleo caliente.
//   · EL MOTOR. Una corona que late encima de todo. Cuando el de atras entra en la ZONA donde
//     quebrar lo pierde, late el DOBLE de rapido y mas grande: es el aviso que no depende de la
//     radio — el duelo mudo no te grita, y ahi el misil tiene que decirlo solo.
//
// El render no manda: lee el misil como lo dejo el sistema (convencion 4).
import { HORNO_VIEJO } from '../data/horno.js';
import { ctx, px } from './ctx.js';
import { proj } from '../core/fx.js';
import { cam } from '../core/state.js';
import { run } from '../core/run.js';
import { velAire } from '../core/aim9.js';
import { AIM9 } from '../data/tuning.js';
import * as blastArt from './blast.js';
import { drawBorde } from './borde.js';
import { luzNoche } from './noche.js';

const HOJA = { src: '../assets/ammo/aim9.png', img: new Image(), ready: false };
HOJA.img.onload = () => { HOJA.ready = true; };
// EL HORNO DE BLENDER (fase 5): la de three.js quedo en ammo/three/ (`?horno=three`, data/horno.js)
HOJA.img.src = HORNO_VIEJO ? HOJA.src.replace('/ammo/', '/ammo/three/') : HOJA.src;
const lista = () => HOJA.ready && HOJA.img.naturalWidth > 0;

// LA GRILLA DE LA HOJA: la MISMA de tools/bake_ammo.html (AIM9_VISTAS). 0° = de cola, 180° = de
// nariz; en las vistas intermedias la nariz queda ARRIBA en el frame.
const FW = 32, PASO = 20, NV = 10;
// EL TAMAÑO EN EL MUNDO. El misil real mide 2,9 m, que en la escala del juego son ~1,4 unidades:
// se lo dibuja con 2,2 (exagerado, como todo lo que vuela en este juego — a escala real de cola es
// una cruz de tres pixeles). El frame horneado es un poco mas grande que el misil: 3,42 de camara
// contra 2,9 de largo.
const LARGO = 2.2, CAJA = LARGO * 3.42 / 2.9;
// debajo de este tamaño de frame (px) el sprite es puré: se dibuja el punto
const MIN_SPRITE = 7;

const ROJO = { halo: '#5e1610', medio: '#b3261a', nucleo: '#ff5b3a', viejo: '#6b3a33' };

/** La ESTELA: segmento por segmento, cada uno con la edad de su punta (la mantiene core/aim9.js).
 *
 *  EL ANCHO SALE DE LA PERSPECTIVA, no de una constante. La primera version era un trazo de ancho
 *  fijo, y el del Sidewinder de atras —cuyo humo se queda en el aire y te pasa al lado de la
 *  cabeza— salia como una raya recta y fina hasta la esquina de la pantalla: se leia como un cable
 *  atado al misil. Con el ancho de su profundidad es lo que es, una columna de humo que se abre al
 *  pasar junto a la camara. Y ahi mismo se APAGA: lo que esta pegado a la camara es borroso, no un
 *  tajo que cruza el juego. */
function estela(m) {
  const tr = m.tr;
  if (!tr || tr.length < 1) return;
  const pts = [];
  for (const p of tr) if (p.z > 2.5) pts.push(p);
  const s0 = proj(m.x, m.y, m.z);
  // EL DE FRENTE SE TIENE QUE VER VENIR (pedido del autor, 2/10: "hacelo mas visible desde lejos").
  // Sale a 230 del avion, donde la perspectiva deja la estela en un pelo: era un punto con una
  // rayita, perdido contra el horizonte hasta tenerlo encima. Para ese el trazo tiene un piso mas
  // ancho y se apaga menos — el de la cola no cambia, que de cerca ya se lee solo.
  const fr = m.modo === 'frente';
  ctx.save();
  ctx.lineCap = 'round';
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = i + 1 < pts.length ? pts[i + 1] : null;
      const pa = proj(a.x, a.y, a.z), pb = b ? proj(b.x, b.y, b.z) : s0;
      // la edad apaga y abre: joven es un hilo rojo vivo, viejo un humo ancho y oscuro que se va
      const u = Math.min(1, a.e / AIM9.ESTELA_VIDA);
      const cerca = Math.min(1, Math.max(0, (a.z - 2.5) / 6));   // pegado a la camara, se desvanece
      const r = pass === 0 ? 0.22 + u * 0.3 : 0.08;               // radio del humo, en unidades
      ctx.lineWidth = Math.min(9, Math.max(pass === 0 ? (fr ? 4 : 2.2) : (fr ? 1.8 : 1), r * 2 * pa.k));
      ctx.globalAlpha = Math.min(1, (pass === 0 ? (fr ? 0.6 : 0.34) : (fr ? 1 : 0.85)) * (1 - u) * (1 - u * 0.4) * cerca);
      if (ctx.globalAlpha < 0.02) continue;
      ctx.strokeStyle = pass === 0 ? (u < 0.5 ? ROJO.halo : ROJO.viejo) : (u < 0.35 ? ROJO.nucleo : ROJO.medio);
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
    }
  }
  ctx.restore();
}

/** LA VISTA Y EL GIRO del sprite, a partir del eje del misil (su velocidad contra el AIRE).
 *
 *  La vista es el angulo entre el eje y el RAYO de la camara al misil, no el eje Z: el de atras
 *  nace al costado de la pantalla, y algo que vuela hacia adelante a un costado tuyo se ve de
 *  tres cuartos. El giro es hacia donde cae la nariz en la pantalla: se proyecta un paso del eje. */
function pose(m) {
  const v = velAire(m, run.spd);
  const rx = m.x - cam.x, ry = m.y - cam.y, rz = m.z;
  const nv = Math.hypot(v.x, v.y, v.z) || 1, nr = Math.hypot(rx, ry, rz) || 1;
  const cos = (v.x * rx + v.y * ry + v.z * rz) / (nv * nr);
  const th = Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
  const col = Math.max(0, Math.min(NV - 1, Math.round(th / PASO)));
  // de punta (cola o nariz) la cruz es simetrica: girarla por un eje que casi no se ve la haria
  // rolar al compas del ruido — se deja derecha
  let rot = 0;
  if (th > 12 && th < 168) {
    const e = 0.02 / nv;
    const a = proj(m.x, m.y, m.z), b = proj(m.x + v.x * e, m.y + v.y * e, m.z + v.z * e);
    // la hoja tiene la nariz ARRIBA (-y): se gira para que ese arriba apunte a (b - a)
    rot = Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2;
  }
  return { col, rot, th };
}

/** EL MOTOR: una llama chica en anillos que se afinan hacia el centro, del rojo apagado al blanco
 *  del nucleo — el mismo lenguaje que la tobera del Harrier (render/caza.js), en chico.
 *
 *  CHICA A PROPOSITO. La primera version era una corona cuadrada del tamaño del misil y en la zona
 *  crecia un 50%: la caja naranja tapaba el cuerpo entero justo cuando mas habia que verlo. El
 *  aviso de la ZONA —el de atras ya esta donde quebrar lo pierde— es que late el DOBLE de rapido
 *  y un poco mas grande, no que se vuelva una mancha. */
const LLAMA = ['#b8341a', '#f07c22', '#ffb43c', '#fff1c8'];
function motor(sx, sy, k, m, th) {
  const zona = m.modo === 'cola' && m.zona && m.fase === 'guia';
  const hz = zona ? 44 : 22;
  const fl = 0.78 + Math.sin(run.t * hz + (m.seed || 0)) * 0.22;
  // DE NARIZ LA LLAMA LA TAPA EL CUERPO: queda un resplandor apenas, detras
  const deNariz = th > 120;
  const w = Math.max(2, k * (deNariz ? 0.16 : 0.3) * (zona ? 1.3 : 1) * fl);
  for (let i = 0; i < LLAMA.length; i++) {
    const ww = Math.max(1, w * (1 - i * 0.24));
    ctx.globalAlpha = i === 0 ? 0.7 : 1;
    px(sx - ww / 2, sy - ww / 2, ww, ww, LLAMA[i]);
  }
  ctx.globalAlpha = 1;
}

/** Un Sidewinder, con su estela. Lo llama game.js en DOS pasadas —como a LA COLA—: el que esta
 *  mas lejos que tu avion va con el mundo, y el que viene de atras (mas cerca de la camara que el
 *  avion) va DESPUES del avion, encima. */
/** EL ESTALLIDO DE LOS MISILES QUE SE DIERON ENTRE ELLOS (el autor, 1/10: "tiene que ser una BUENA
 *  explosion"). Va por capas, de atras hacia adelante, y cada una tiene su momento:
 *    · EL HUMO que queda: bocanadas oscuras que se abren y suben, desde los 0,35 s hasta el final
 *    · LA ONDA: un aro claro que se abre rapido en el primer tercio de segundo
 *    · LAS BOLAS DE FUEGO: la hoja de explosiones de frente (render/blast.js), DOS —una por misil,
 *      la segunda desfasada y corrida— mas una tercera chica si eran tres o cuatro
 *    · LAS ESQUIRLAS: pedazos de misil con cola de fuego, saliendo en abanico y cayendo
 *    · EL DESTELLO blanco del primer instante
 *  Todo sale de `m.te` (el reloj del estallido) y de `m.seed`: sin azar, el mismo estallido se dibuja
 *  igual cuadro a cuadro. */
function drawEstallido(m) {
  const s = proj(m.x, m.y, m.z), k = s.k, t = m.te, n = m.lider || 2;
  const U = k * 1.0;                                   // una unidad de mundo, en pixeles
  ctx.save();
  // EL HUMO (atras de todo)
  if (t > 0.35) {
    const p = (t - 0.35) / (AIM9.ESTALLIDO_T - 0.35);
    for (let i = 0; i < 9; i++) {
      const a = m.seed + i * 2.4, rr = (1.2 + p * 3.2) * U * (0.5 + ((i * 37) % 7) / 9);
      const sz = Math.max(2, (1.1 + p * 1.6) * U * (0.6 + ((i * 13) % 5) / 8));
      ctx.globalAlpha = Math.max(0, 0.6 * (1 - p) * (1 - p * 0.3));
      px(s.x + Math.cos(a) * rr - sz / 2, s.y + Math.sin(a) * rr * 0.7 - p * 2.2 * U - sz / 2, sz, sz,
        i % 3 ? '#2f2d2a' : '#4a4640');
    }
  }
  // LA ONDA
  if (t < 0.38) {
    const p = t / 0.38;
    ctx.globalAlpha = (1 - p) * 0.8;
    ctx.strokeStyle = '#fff2c8'; ctx.lineWidth = Math.max(1, (1 - p) * 0.5 * U);
    ctx.beginPath(); ctx.ellipse(s.x, s.y, (1 + p * 9) * U, (1 + p * 9) * U * 0.82, 0, 0, 6.2832); ctx.stroke();
    ctx.lineWidth = 1;
  }
  ctx.globalAlpha = 1;
  // LAS BOLAS DE FUEGO
  const bolas = [[0, 0, 0, 0.62], [0.12, 1.6, -0.7, 0.5], [0.22, -1.3, 0.9, 0.38], [0.3, 0.4, 1.4, 0.34]].slice(0, Math.max(2, n));
  for (const [t0, dx, dy, esc] of bolas) {
    if (t < t0) continue;
    if (blastArt.isReady()) blastArt.drawBlast(ctx, proj, { x: m.x + dx, y: m.y + dy, z: m.z, boomT: t - t0, scale: esc }, k);
    else if (t - t0 < 0.9) {
      const p = (t - t0) / 0.9, R = (1 + p * 3) * U * esc * 2;
      ctx.globalAlpha = 1 - p;
      ctx.beginPath(); ctx.arc(s.x + dx * U, s.y - dy * U, R, 0, 6.2832); ctx.fillStyle = p < 0.4 ? '#ffd98a' : '#d9652b'; ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  // LAS ESQUIRLAS: salen rapido, frenan y caen; la cola es el tramo que acaban de recorrer
  if (t < 0.95) {
    const pos = (i, tt) => {
      const a = m.seed * 3 + i * 0.57 + ((i * 7919) % 11) * 0.09, v = (7 + ((i * 31) % 9)) * U;
      const d = v * (1 - Math.exp(-tt * 3.2)) / 3.2 * 2.2;
      return [s.x + Math.cos(a) * d, s.y + Math.sin(a) * d * 0.8 + tt * tt * 5 * U];
    };
    ctx.lineCap = 'round';
    for (let i = 0; i < 11; i++) {
      const [x1, y1] = pos(i, t), [x0, y0] = pos(i, Math.max(0, t - 0.09));
      ctx.globalAlpha = Math.max(0, 1 - t / 0.95);
      ctx.strokeStyle = t < 0.35 ? '#ffd98a' : '#e8823a'; ctx.lineWidth = Math.max(1, 0.22 * U);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      const c = Math.max(1, 0.3 * U);
      px(x1 - c / 2, y1 - c / 2, c, c, i % 2 ? '#2e3336' : '#fff2c8');
    }
    ctx.lineWidth = 1;
  }
  // EL DESTELLO
  if (t < 0.12) {
    ctx.globalAlpha = 1 - t / 0.12;
    ctx.beginPath(); ctx.arc(s.x, s.y, (2.2 + t * 14) * U, 0, 6.2832); ctx.fillStyle = '#fffbe8'; ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

export function drawAim9(m) {
  if (m.z <= 2) return;
  if (m.fase === 'estallido') { drawEstallido(m); return; }
  estela(m);
  const s = proj(m.x, m.y, m.z), k = s.k;
  // DE NOCHE EL MOTOR ILUMINA (render/noche.js): el misil se ve venir por su luz
  luzNoche(ctx, s.x, s.y, 8 + k * 2, [255, 120, 60], 0.8);
  const caja = CAJA * k;
  const { col, rot, th } = pose(m);
  // la cola del misil: donde sale la llama, medio largo atras de su centro sobre el eje proyectado
  if (caja >= MIN_SPRITE && lista()) {
    const tam = Math.round(caja);
    ctx.save();
    ctx.translate(Math.round(s.x), Math.round(s.y));
    if (rot) ctx.rotate(rot);
    const sm = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(HOJA.img, col * FW, 0, FW, FW, -tam / 2, -tam / 2, tam, tam);
    // EL MISIL TAMBIEN BRILLA (autor, 4/10): el caño de metal a contraluz, con sus destellos —y se
    // lo ve venir antes (render/borde.js)
    drawBorde(ctx, HOJA.img, col * FW, 0, FW, FW, -tam / 2, -tam / 2, tam, tam);
    ctx.imageSmoothingEnabled = sm;
    ctx.restore();
    // la llama va en la COLA: de cola pura es el centro; de costado, medio largo hacia atras
    const f = Math.sin(th * Math.PI / 180) * 0.5 * LARGO * k;
    const ang = rot - Math.PI / 2;   // hacia donde apunta la nariz en pantalla
    motor(s.x - Math.cos(ang) * f, s.y - Math.sin(ang) * f, k, m, th);
    return;
  }
  // DE LEJOS: el punto del Sea Dart, en chico — ojiva oscura con la corona que late
  const fl = 0.75 + Math.sin(run.t * 30 + m.z) * 0.25;
  // EL DE FRENTE, DE LEJOS: un piso de tamaño (no menos de 7 px de corona), un resplandor y UN ARO
  // ROJO QUE LATE alrededor — a 230 el punto de siempre media un pixel y medio. El aro y no la
  // estela, porque viniendo de punta la estela queda escondida atras del propio misil.
  const fr = m.modo === 'frente';
  if (fr) {
    const h = Math.max(15, 3 * k) * (0.8 + fl * 0.3);
    ctx.globalAlpha = 0.34;
    px(s.x - h / 2, s.y - h / 2, h, h, '#ff5b3a');
    const lat = 0.5 + 0.5 * Math.sin(run.t * 16 + (m.seed || 0));
    ctx.globalAlpha = 0.35 + lat * 0.6;
    ctx.strokeStyle = '#ff3b24'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(s.x, s.y, Math.max(9, 2.2 * k) + lat * 2.5, 0, 6.2832); ctx.stroke();
    ctx.lineWidth = 1;
  }
  const w = Math.max(fr ? 7 : 1.5, 1.1 * k * fl);
  ctx.globalAlpha = fr ? 0.9 : 0.55;
  px(s.x - w / 2, s.y - w / 2, w, w, '#f0582a');
  ctx.globalAlpha = 1;
  const b = Math.max(fr ? 4 : 1, 0.7 * k);
  px(s.x - b / 2, s.y - b / 2, b, b, '#2e3336');
  const e = Math.max(fr ? 2.5 : 1, 0.35 * k);
  px(s.x - e / 2, s.y - e / 2, e, e, '#fff6d8');
}
