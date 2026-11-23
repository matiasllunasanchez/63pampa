// LA PISTA DE LA BAM MALVINAS EN 3D (el sobrevuelo, 23/11): donde se aterriza para comprar en la TIENDA (islas.js
// `pistaEscena`, data/islas_teatro.js PISTA). Asfalto gris, la linea del eje cortada, las barras de las cabeceras y sus
// numeros como bloques. Un poco arriba del suelo (el relieve fino del DEM la atravesaria) y sin escribir profundidad.
import * as mundo from './mundo.js';
const THREE = window.THREE || null;
const R = { g: null };

function textura() {
  const W = 64, H = 1024, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = '#3b3f43'; x.fillRect(0, 0, W, H);
  // el borde blanco
  x.fillStyle = '#d9dcd6'; x.fillRect(2, 0, 2, H); x.fillRect(W - 4, 0, 2, H);
  // el eje, cortado
  for (let y = 60; y < H - 60; y += 36) x.fillRect(W / 2 - 1, y, 2, 18);
  // las barras de las cabeceras
  for (const y0 of [8, H - 32]) for (let i = 0; i < 6; i++) x.fillRect(8 + i * 8, y0, 4, 24);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter;
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
