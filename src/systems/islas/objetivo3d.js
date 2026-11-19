// LAS ISLAS REALES — EL OBJETIVO EN 3D (prototipo I0): la BASE COSTERA del pasillo, horneada en Blender
// (assets/mallas/base_costera.js), con el mismo dibujo que el avion (avion3d.js `grupoDe`), apoyada en su
// explanada; y la MARCA: una columna naranja que sube desde ella y se ve de lejos y desde arriba
// (la del pasillo, en 2D, la pone game.js con islas.js `objetivoPasillo`). Destruida, queda aplastada y
// sin columna.
import * as avion3d from './avion3d.js';
const THREE = window.THREE || null;
const R = { grupo: null, base: null, columna: null };
const ALTO_COLUMNA = 600;

export function frame(escena, o) {
  if (!THREE) return;
  if (!R.grupo) {
    R.grupo = new THREE.Group(); escena.add(R.grupo);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0, 0, ALTO_COLUMNA, 0]), 3));
    // (en lineal: three la vuelve a sRGB al dibujar — el naranja del acento del juego)
    R.columna = new THREE.Line(g, new THREE.LineBasicMaterial({ color: new THREE.Color(1.0, 0.33, 0.03), transparent: true, opacity: 0.8, fog: false }));
    R.columna.frustumCulled = false; R.columna.renderOrder = 4;
    R.grupo.add(R.columna);
  }
  R.grupo.visible = !!o;
  if (!o) return;
  if (!R.base) { R.base = avion3d.grupoDe(o.malla); if (R.base) R.grupo.add(R.base); }
  R.grupo.position.set(o.x, o.g, o.z);
  if (R.base) {
    R.base.rotation.y = -o.rot;
    R.base.scale.set(1, o.vivo ? 1 : 0.3, 1);
  }
  R.columna.visible = o.vivo;
}
