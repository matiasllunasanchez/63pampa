// LA PISTA DE LA BAM MALVINAS EN 3D (el sobrevuelo, 23/11): donde se aterriza para comprar en la TIENDA (islas.js
// `pistaEscena`, data/islas_teatro.js PISTA). Asfalto gris, la linea del eje cortada, las barras de las cabeceras y sus
// numeros como bloques. Un poco arriba del suelo (el relieve fino del DEM la atravesaria) y sin escribir profundidad.
import * as mundo from './mundo.js';
import { PISTA } from '../../data/islas_teatro.js';
const THREE = window.THREE || null;
const R = { g: null };

// LA TEXTURA DEL ASFALTO (25/11, el autor: "hacé lo mismo en la pista de las islas" — lo de la pista del pasillo,
// render/world.js `asfaltoPista`): juntas de losas, parches, fisuras, rodadas y grano, para que rodar se sienta. La hoja
// paso de 64 x 1024 a 256 x 4096 (≈ 0,18 m de costado y 0,3 m a lo largo por pixel; PISTA mide 45 x 1250 m) y lleva
// mipmaps: con tanto detalle, sin ellos a lo lejos titila. Semilla fija: es siempre la misma pista.
const TX = { W: 256, H: 4096 };
function textura() {
  const W = TX.W, H = TX.H, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  let sem = 1982;
  const rnd = () => { sem = (sem * 1664525 + 1013904223) >>> 0; return sem / 4294967296; };
  const mx = W / PISTA.ancho, my = H / PISTA.largo;              // px por metro, de costado y a lo largo
  x.fillStyle = '#3b3f43'; x.fillRect(0, 0, W, H);
  // el TONO que cambia a lo largo: tramos repavimentados en otro momento
  for (let y = 0; y < H;) { const l = (40 + rnd() * 140) * my; x.globalAlpha = 0.05 + rnd() * 0.07; x.fillStyle = rnd() < 0.5 ? '#202427' : '#6a7074'; x.fillRect(0, y, W, l); y += l; }
  // las RODADAS: las dos franjas por donde pasan las ruedas, mas gastadas y con goma
  x.globalAlpha = 0.14; x.fillStyle = '#1c1f21';
  for (const s2 of [-1, 1]) x.fillRect(W / 2 + s2 * 6 * mx - 3 * mx, 0, 6 * mx, H);
  // los PARCHES de reparacion
  for (let i = 0; i < 420; i++) {
    const w = (1.5 + rnd() * 6) * mx, h = (2 + rnd() * 9) * my;
    x.globalAlpha = 0.12 + rnd() * 0.16; x.fillStyle = rnd() < 0.6 ? '#25292c' : '#6c7276';
    x.fillRect(4 * mx + rnd() * (W - 8 * mx - w), rnd() * H, w, h);
  }
  // las JUNTAS de las losas, de lado a lado cada 12 m (lo que mas se lee como avance), y la junta del medio
  x.globalAlpha = 0.45; x.fillStyle = '#1a1d1f';
  for (let y = 0; y < H; y += 12 * my) x.fillRect(0, Math.round(y), W, 1);
  x.globalAlpha = 0.25; x.fillRect(Math.round(W / 4), 0, 1, H); x.fillRect(Math.round(3 * W / 4), 0, 1, H);
  // las FISURAS: rayas finas que serpentean
  x.globalAlpha = 0.5; x.strokeStyle = '#141719'; x.lineWidth = 1;
  for (let i = 0; i < 260; i++) {
    let cx = rnd() * W, cy = rnd() * H; const largo = (3 + rnd() * 14) * my, dir = rnd() < 0.75 ? 0 : 1;
    x.beginPath(); x.moveTo(cx, cy);
    for (let t = 0; t < largo; t += 3) { if (dir) cx += 3 * (rnd() < 0.5 ? 1 : -1) * 0.9; else cy += 3; cx += (rnd() - 0.5) * 2.2; if (dir) cy += (rnd() - 0.5) * 2; x.lineTo(cx, cy); }
    x.stroke();
  }
  // el GRANO: piedritas claras y oscuras
  for (let i = 0; i < 60000; i++) { x.globalAlpha = 0.12 + rnd() * 0.18; x.fillStyle = rnd() < 0.55 ? '#1e2124' : '#8b9195'; x.fillRect((rnd() * W) | 0, (rnd() * H) | 0, 1, 1); }
  // las MARCAS de siempre, encima de todo (a la escala de la hoja nueva: era de 64 x 1024)
  const ex = W / 64, ey = H / 1024;
  x.globalAlpha = 1; x.fillStyle = '#d9dcd6';
  x.fillRect(2 * ex, 0, 2 * ex, H); x.fillRect(W - 4 * ex, 0, 2 * ex, H);                       // el borde blanco
  for (let y = 60 * ey; y < H - 60 * ey; y += 36 * ey) x.fillRect(W / 2 - ex, y, 2 * ex, 18 * ey);   // el eje, cortado
  for (const y0 of [8 * ey, H - 32 * ey]) for (let i = 0; i < 6; i++) x.fillRect((8 + i * 8) * ex, y0, 4 * ex, 24 * ey);   // cabeceras
  // las marcas gastadas: el mismo grano y algun parche las ensucia un poco
  for (let i = 0; i < 9000; i++) { x.globalAlpha = 0.25; x.fillStyle = '#3b3f43'; x.fillRect((rnd() * W) | 0, (rnd() * H) | 0, 1, 1); }
  x.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = 8;
  if ('colorSpace' in t && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** LA PISTA SOBRE EL RELIEVE (23/11, el autor: "a veces la pista desaparece por la altura del terreno"): un plano a
 *  la altura del centro se hundia donde el suelo sube. Ahora es una tira de PASOS tramos a lo largo, y cada fila de
 *  vertices toma la altura del suelo ahi (la mas alta de sus dos bordes) + ALTO_PISTA. Se arma en coordenadas del mapa
 *  y se rehace si la pista se mueve (el origen del mapa cambia al cargar). */
const PASOS = 50, ALTO_PISTA = 0.9;
function armarGeo(p) {
  const geo = new THREE.PlaneGeometry(1, 1, 1, PASOS);
  const pos = geo.attributes.position, sy = Math.sin(p.rot), cy = Math.cos(p.rot);
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) * p.ancho, v = pos.getY(i) * p.largo;   // u de costado, v a lo largo
    const x = p.x + sy * v + cy * u, z = p.z - cy * v + sy * u;
    const bx = cy * p.ancho / 2, bz = sy * p.ancho / 2;
    const h = Math.max(0, mundo.sueloH(x, z), mundo.sueloH(p.x + sy * v + bx, p.z - cy * v + bz), mundo.sueloH(p.x + sy * v - bx, p.z - cy * v - bz));
    pos.setXYZ(i, x, h + ALTO_PISTA, z);
  }
  pos.needsUpdate = true; geo.computeBoundingSphere();
  return geo;
}

/** Un cuadro: `p` = islas.pistaEscena() o null. */
export function frame(escena, p) {
  if (!THREE) return;
  if (!R.g && p) {
    R.g = new THREE.Mesh(armarGeo(p), new THREE.MeshBasicMaterial({ map: textura(), side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
    R.g.renderOrder = 1; escena.add(R.g); R.en = p.x + ',' + p.z;
  }
  if (!R.g) return;
  R.g.visible = !!p;
  if (!p) return;
  if (R.en !== p.x + ',' + p.z) { R.g.geometry.dispose(); R.g.geometry = armarGeo(p); R.en = p.x + ',' + p.z; }
}
