// LAS ISLAS REALES — EL TEATRO EN 3D (prototipo I1, docs/proyecto/PLAN_TEATRO_MALVINAS.md): dibuja lo que arma
// systems/islas/teatro.js —las piezas de las bases, los buques, las PAC y los soldados— con las mallas de Blender
// (assets/mallas, `exportar_malla.py --modulo`), con el mismo dibujo que el avion (avion3d.js `grupoDe`).
//
// LAS MALLAS SALEN EN SUS UNIDADES (`--k 1`) y aca se llevan a METROS por su medida real (MEDIDA: el largo mayor
// en planta; el soldado, por su alto). Algunas van EXAGERADAS a proposito, como en el pasillo: un soldado de 1,8 m
// visto desde 145 m es medio pixel.
//
// De lejos se apagan (LEJOS): los soldados primero; los buques, lo ultimo.
import { grupoDe } from './avion3d.js';
import { pose } from './soldados.js';
import * as mundo from './mundo.js';
import { ahora as climaAhora } from './clima.js';

const THREE = window.THREE || null;

const MEDIDA = { harrier: 14.5, t21: 117, t42: 125, log: 126, nido_rapier: 12, manpad: 6, camion_aa: 9, radar: 9, carpa: 8,
  deposito: 14, puesto: 8, pucara: 14.25, herc: 29.8 };
const ALTO = { soldado_corre: 3.4 };   // (×1,9: exagerado para que se lea)
// LO DE TIERRA, EXAGERADO (como el pasillo): a la medida real una carpa desde la vista de arriba era un punto
const EXAGERA = { nido_rapier: 2, manpad: 2.2, camion_aa: 2, radar: 2, carpa: 2, deposito: 1.8, puesto: 2, harrier: 1.3 };
const LEJOS = { soldado: 2500, pieza: 9000, buque: 22000, avion: 14000, trinchera: 4000, bandera: 6000 };
const K = {};
let escena = null;

function escala(clave, g) {
  if (K[clave]) return K[clave];
  const geo = g.children[0].geometry;
  geo.computeBoundingBox();
  const b = geo.boundingBox, sx = b.max.x - b.min.x, sy = b.max.y - b.min.y, sz = b.max.z - b.min.z;
  K[clave] = ALTO[clave] ? ALTO[clave] / sy : (MEDIDA[clave] || 10) * (EXAGERA[clave] || 1) / Math.max(sx, sz);
  return K[clave];
}
// LOS SOLDADOS: todas sus poses a la MISMA escala (la del alto de la carrera, ALTO_SOLDADO): el cuerpo a tierra es bajo
// y por su alto saldria gigante
const ALTO_SOLDADO = 4.6, ALTO_MALLA = 2.08;   // (×2,2: mas que la ronda vieja — corriendo, a 100 m, se tienen que leer)
function grupoSoldado(clave) {
  const g = grupoDe(clave);
  if (!g) return null;
  g.scale.setScalar(ALTO_SOLDADO / ALTO_MALLA); g.rotation.order = 'YXZ'; g.visible = false;
  escena.add(g);
  return g;
}
// ---- LAS TRINCHERAS (soldados.js `trinchera`): el pozo oscuro y las bolsas de arena a los dos lados, por tramos
// cortos que siguen el relieve. Cajas con color por vertice (arriba claro, los costados a la sombra), una malla por
// trinchera. A la escala exagerada del soldado (4,6 m): el pozo de 3,6 m de ancho, el parapeto de 1,6 m.
const TR = { PASO: 2.6, ANCHO: 3.6, BOLSA_H: 1.6, BOLSA_A: 1.3 };
const _c = THREE ? new THREE.Color() : null;
function caja(pos, col, cx, cy, cz, sx, sy, sz, rot, hex) {
  const c = Math.cos(rot), sn = Math.sin(rot), hx = sx / 2, hz = sz / 2;
  // las 4 esquinas en planta (x a lo largo, z a lo ancho), rotadas
  const P4 = [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]].map(([a, b]) => [cx + a * c - b * sn, cz + a * sn + b * c]);
  const y0 = cy, y1 = cy + sy;
  _c.set(hex);
  const tono = k => [_c.r * k, _c.g * k, _c.b * k];
  const tri = (a, b, d, t) => { pos.push(...a, ...b, ...d); for (let i = 0; i < 3; i++) col.push(...t); };
  const q = (a, b, d, e, t) => { tri(a, b, d, t); tri(a, d, e, t); };
  const v = (i, y) => [P4[i][0], y, P4[i][1]];
  q(v(0, y1), v(3, y1), v(2, y1), v(1, y1), tono(1.15));                       // arriba
  const lados = [0.72, 0.9, 0.62, 0.82];
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(v(i, y0), v(j, y0), v(j, y1), v(i, y1), tono(lados[i])); }
}
function mallaTrinchera(t) {
  const pos = [], col = [];
  for (let i = 0; i < t.pts.length - 1; i++) {
    const [ax, az] = t.pts[i], [bx, bz] = t.pts[i + 1], L = Math.hypot(bx - ax, bz - az), rot = Math.atan2(bz - az, bx - ax);
    const nx = -Math.sin(rot), nz = Math.cos(rot), n = Math.max(1, Math.round(L / TR.PASO));
    for (let k = 0; k < n; k++) {
      const f = (k + 0.5) / n, x = ax + (bx - ax) * f, z = az + (bz - az) * f, h = Math.max(0, mundo.sueloH(x, z));
      // el POZO: una franja oscura apenas sobre el suelo
      caja(pos, col, x, h + 0.12, z, L / n + 0.3, 0.1, TR.ANCHO, rot, '#1e1a12');
      // LAS BOLSAS: el parapeto de adelante (mas alto) y el de atras, alternando el tono
      for (const [lado, alto] of [[1, TR.BOLSA_H], [-1, TR.BOLSA_H * 0.7]]) {
        const d = (TR.ANCHO / 2 + TR.BOLSA_A / 2) * lado, ox = x + nx * d, oz = z + nz * d;
        const hb = Math.max(0, mundo.sueloH(ox, oz));
        caja(pos, col, ox, hb - 0.3, oz, L / n + 0.15, alto + 0.3, TR.BOLSA_A, rot, (k + (lado > 0 ? 0 : 1)) % 2 ? '#8c7b55' : '#7b6b49');
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true }));
  m.renderOrder = 2;
  return m;
}
// ---- LAS BANDERAS (teatro.js `banderas`): un mastil blanco y el paño que flamea con el viento del clima. La
// argentina, celeste y blanca con el sol; la de ellos, la de INGLATERRA (21/11, el autor: "la bandera es INGLATERRA, no
// esa": la cruz roja de San Jorge sobre blanco, no la Union Jack). Exageradas como todo lo de tierra.
const BAND = { MASTIL: 18, ANCHO: 9, SEG: 12 };
const TEX = {};
function texBandera(bando) {
  if (TEX[bando]) return TEX[bando];
  const cv = document.createElement('canvas'), x = cv.getContext('2d');
  if (bando === 'arg') {
    cv.width = 96; cv.height = 60;
    x.fillStyle = '#74acdf'; x.fillRect(0, 0, 96, 60);
    x.fillStyle = '#ffffff'; x.fillRect(0, 20, 96, 20);
    x.fillStyle = '#f6b40e'; x.beginPath(); x.arc(48, 30, 6, 0, Math.PI * 2); x.fill();
    x.strokeStyle = '#f6b40e'; x.lineWidth = 1.5;
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; x.beginPath(); x.moveTo(48 + Math.cos(a) * 6, 30 + Math.sin(a) * 6); x.lineTo(48 + Math.cos(a) * 9, 30 + Math.sin(a) * 9); x.stroke(); }
    x.fillStyle = '#c8840a'; x.fillRect(46, 28, 1, 1); x.fillRect(49, 28, 1, 1); x.fillRect(47, 32, 2, 1);
  } else {
    cv.width = 100; cv.height = 60;
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, 100, 60);
    x.fillStyle = '#ce1124'; x.fillRect(43, 0, 14, 60); x.fillRect(0, 23, 100, 14);
  }
  const t = new THREE.CanvasTexture(cv);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter;
  if ('colorSpace' in t && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
  return (TEX[bando] = t);
}
function grupoBandera(b) {
  const g = new THREE.Group(), alto = BAND.ANCHO * (b.bando === 'arg' ? 0.625 : 0.6);   // (la de Inglaterra es 3:5)
  const mastil = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, BAND.MASTIL, 6), new THREE.MeshBasicMaterial({ color: '#d9d6cc' }));
  mastil.position.y = BAND.MASTIL / 2; g.add(mastil);
  const geo = new THREE.PlaneGeometry(BAND.ANCHO, alto, BAND.SEG, 1);
  geo.translate(BAND.ANCHO / 2 + 0.25, BAND.MASTIL - alto / 2 - 0.3, 0);
  const pano = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: texBandera(b.bando), side: THREE.DoubleSide }));
  g.add(pano);
  g.userData.geo = geo; g.userData.x0 = Float32Array.from(geo.attributes.position.array);
  return g;
}
function flamea(g, t, fase, fuerza) {
  const a = g.userData.geo.attributes.position, x0 = g.userData.x0;
  for (let i = 0; i < a.count; i++) {
    const x = x0[i * 3] - 0.25, k = x / BAND.ANCHO;   // (pegado al mastil no se mueve; la punta, lo que mas)
    a.array[i * 3 + 2] = Math.sin(x * 0.7 - t * (4 + fuerza * 0.4) + fase) * (0.35 + 0.08 * fuerza) * k;
    a.array[i * 3 + 1] = x0[i * 3 + 1] - k * k * Math.max(0, 1.2 - fuerza * 0.12);   // (sin viento, cae)
  }
  a.needsUpdate = true;
}

/** El grupo de `o` (lo crea cuando su malla llego). */
function grupo(o, clave) {
  if (o.__g && o.__gk === clave) return o.__g;
  const g = grupoDe(clave);
  if (!g) return null;
  if (o.__g) escena.remove(o.__g);
  g.scale.setScalar(escala(clave, g));
  g.rotation.order = 'YXZ';
  escena.add(g);
  o.__g = g; o.__gk = clave;
  return g;
}
const lejos = (g, cam, x, y, z, max) => {
  const d = Math.hypot(x - cam.position.x, z - cam.position.z);
  g.visible = d < max;
  return g.visible;
};

/** Un cuadro. `E` = teatro.js `escena()`; `cazas` = los Harriers del duelo en el mapa (solo desde arriba: en las
 *  vistas del pasillo los dibuja el pasillo); `cam` = la camara de three. */
export function frame(sc, E, cazas, cam, cha) {
  escena = sc;
  if (!E) return;
  for (const e of E.piezas) {
    const g = grupo(e, e.malla);
    if (!g || !lejos(g, cam, e.x, e.g, e.z, LEJOS.pieza)) continue;
    g.position.set(e.x, e.g, e.z); g.rotation.set(0, -e.rot, 0);
    // la pieza rota queda aplastada y ladeada
    const k = escala(e.malla, g);
    g.scale.set(k, e.vivo ? k : k * 0.3, k);
    if (!e.vivo) g.rotation.z = 0.25;
  }
  for (const b of E.buques) {
    const g = grupo(b, b.malla);
    if (!g || !lejos(g, cam, b.x, 0, b.z, LEJOS.buque)) continue;
    // (su tamaño: el portaaviones y la barcaza usan otra malla agrandada o achicada — data/islas_teatro.js `esc`)
    if (b.esc && b.esc !== 1 && !g.userData.esc) { g.scale.multiplyScalar(b.esc); g.userData.esc = b.esc; }
    // el que se hunde: escora y baja de a poco (teatro.js `hund`), de proa
    const h = b.vivo ? 0 : b.hund || 0, k = b.vivo ? 0 : Math.min(1, h / (b.h || 20));
    g.position.set(b.x, -h, b.z); g.rotation.set(k * 0.18, -b.rot, k * 0.4);
  }
  // LOS SOLDADOS (systems/islas/soldados.js): uno por uno, con la malla de su pose (la carrera en tres cuadros, con
  // caja, o cuerpo a tierra); cada pose es un grupo propio que se prende y se apaga (cambiar mallas cada cuadro es basura)
  for (const s of E.soldados) {
    const clave = pose(s);
    s.__p = s.__p || {};
    const g = s.__p[clave] || (s.__p[clave] = grupoSoldado(clave));
    if (s.__vis && s.__vis !== g) s.__vis.visible = false;
    if (!g) { s.__vis = null; continue; }
    s.__vis = g;
    if (!lejos(g, cam, s.x, s.g, s.z, LEJOS.soldado)) continue;
    // (la malla mira a −x: rotar `π − yaw` la pone mirando a donde va; el caido, un poco torcido)
    g.position.set(s.x, s.g - (s.hund || 0), s.z); g.rotation.set(0, Math.PI - s.yaw + (s.vivo ? 0 : 0.6), 0);
  }
  if (THREE) {
    for (const t of E.trincheras || []) {
      if (!t.__g) { t.__g = mallaTrinchera(t); escena.add(t.__g); }
      const [x, z] = t.pts[t.pts.length >> 1];
      lejos(t.__g, cam, x, 0, z, LEJOS.trinchera);
    }
    const c = climaAhora(), vx = c ? c.vx : 6, vz = c ? c.vz : 0, fuerza = Math.min(12, Math.hypot(vx, vz)), rumbo = -Math.atan2(vz, vx);
    for (const b of E.banderas || []) {
      if (!b.__g) { b.__g = grupoBandera(b); escena.add(b.__g); }
      if (!lejos(b.__g, cam, b.x, b.g, b.z, LEJOS.bandera)) continue;
      b.__g.position.set(b.x, b.g, b.z);
      b.__g.rotation.set(0, rumbo + Math.sin(E.t * 0.5 + b.fase) * 0.15, 0);
      flamea(b.__g, E.t, b.fase, fuerza);
    }
  }
  for (const c of E.pac) {
    c.__gs = c.__gs || [{}, {}];
    for (let i = 0; i < 2; i++) {
      const g = grupo(c.__gs[i], 'harrier');
      if (!g) continue;
      const a = c.aviones[i];
      if ((c.estado !== 'orbita' && c.estado !== 'vector') || !a) { g.visible = false; continue; }
      if (!lejos(g, cam, a.x, a.y, a.z, LEJOS.avion)) continue;
      // en el viraje van ladeados hacia adentro
      g.position.set(a.x, a.y, a.z); g.rotation.set(0, -a.yaw, c.estado === 'vector' || c.forma === 'ocho' ? 0 : -0.45);
    }
  }
  frame.cazas = frame.cazas || [];
  for (let i = 0; i < Math.max(cazas.length, frame.cazas.length); i++) {
    const o = frame.cazas[i] || (frame.cazas[i] = {});
    const g = grupo(o, 'harrier');
    if (!g) continue;
    const h = cazas[i];
    g.visible = !!h;
    if (h) { g.position.set(h.x, h.y, h.z); g.rotation.set(h.pitch || 0, -h.yaw, -(h.roll || 0)); lejos(g, cam, h.x, h.y, h.z, LEJOS.avion); }
  }
  // LA CHANCHA (solo desde arriba: en las vistas del pasillo la dibuja el pasillo)
  const gc = grupo(frame.cha || (frame.cha = {}), 'herc');
  if (gc) { gc.visible = !!cha; if (cha) { gc.position.set(cha.x, cha.y, cha.z); gc.rotation.set(0, -cha.yaw, 0); } }
}

/** Fuera de las islas: todo apagado. */
export function apagar(E) {
  if (!E) return;
  for (const o of [...E.piezas, ...E.buques, ...(E.trincheras || []), ...(E.banderas || [])]) if (o.__g) o.__g.visible = false;
  for (const s of E.soldados) for (const g of Object.values(s.__p || {})) if (g) g.visible = false;
  for (const c of E.pac) for (const o of c.__gs || []) if (o.__g) o.__g.visible = false;
  for (const o of frame.cazas || []) if (o.__g) o.__g.visible = false;
  if (frame.cha && frame.cha.__g) frame.cha.__g.visible = false;
}
