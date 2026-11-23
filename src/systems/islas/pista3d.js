// LA PISTA DE LA BAM MALVINAS EN 3D (el sobrevuelo, 23/11): donde se aterriza para comprar en la TIENDA (islas.js
// `pistaEscena`, data/islas_teatro.js PISTA). Asfalto gris, la linea del eje cortada, las barras de las cabeceras y sus
// numeros como bloques. Un poco arriba del suelo (el relieve fino del DEM la atravesaria) y sin escribir profundidad.
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

/** Un cuadro: `p` = islas.pistaEscena() o null. */
export function frame(escena, p) {
  if (!THREE) return;
  if (!R.g && p) {
    const geo = new THREE.PlaneGeometry(1, 1); geo.rotateX(-Math.PI / 2);
    R.g = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: textura(), depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
    R.g.renderOrder = 1; escena.add(R.g);
  }
  if (!R.g) return;
  R.g.visible = !!p;
  if (!p) return;
  R.g.position.set(p.x, p.h + 0.8, p.z);
  R.g.scale.set(p.ancho, 1, p.largo);
  R.g.rotation.y = -p.rot;
}
