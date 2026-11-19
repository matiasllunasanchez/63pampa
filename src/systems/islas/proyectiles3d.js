// LAS ISLAS REALES — LOS PROYECTILES EN 3D (prototipo I0; autor, 19/11: "los misiles no se ven").
//
// Los proyectiles son los del PASILLO (core/world.js: balas, misiles enemigos y trazadoras, misiles propios):
// los mueve y los choca el pasillo de siempre, en su carril. Aca solo se DIBUJAN en el mapa, con el punto que
// arma systems/islas/islas.js `proyectiles()`: un punto brillante del tamaño fijo en pantalla (a 480x270 un
// misil de verdad es un pixel) y una estela corta hacia de donde viene. Los tapa el terreno (prueba de
// profundidad contra el de Dusk Patrol).
import { SUN } from './mundo.js';
const THREE = window.THREE || null;
const MAX = 256;
// (en sRGB, como se piensan; `lin` los pasa a lineal porque three los convierte de vuelta al dibujar)
const lin = c => c.map(v => Math.pow(v, 2.2));
const COLOR = {
  bala: lin([1.0, 0.91, 0.66]),      // la del cañon propio, paja
  traza: lin([1.0, 0.48, 0.16]),     // trazadora enemiga, naranja
  misil: lin([1.0, 0.30, 0.12]),     // misil enemigo, rojo fuego
  propio: lin([1.0, 0.97, 0.92]),    // misil propio, blanco
};
const HUMO = lin([0.85, 0.82, 0.78]), CABEZA = lin([1, 0.95, 0.8]);
const R = { puntos: null, grandes: null, lineas: null, bombas: null, sombras: null, mira: null };
// (clara: oscura no se distinguia del mar oscuro)
const BOMBA = lin([0.95, 0.9, 0.7]), SOMBRA = [0, 0, 0], HILO = lin([0.85, 0.82, 0.7]);
// LA SOMBRA de la bomba se corre con la altura (el sol de costado): desde arriba, la bomba y su sombra se van
// juntando mientras cae y se tocan al pegar. Asi se LEE la caida desde la vista cenital.
// (la MISMA luz que la sombra del avion — avion3d.js `sombra`: el sol con la mitad de su horizontal)
const SOL_X = -SUN[0] * 0.5, SOL_Z = -SUN[2] * 0.5;
const GRANDE = { misil: 1, propio: 1 };

function capa(tipo, tam) {
  const g = new THREE.BufferGeometry();
  const n = tipo === 'puntos' ? MAX : MAX * 2;
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setDrawRange(0, 0);
  const o = tipo === 'puntos'
    ? new THREE.Points(g, new THREE.PointsMaterial({ size: tam, sizeAttenuation: false, vertexColors: true, fog: false }))
    : new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, fog: false, transparent: true, opacity: 0.7 }));
  o.frustumCulled = false; o.renderOrder = 5;
  return o;
}

export function crear(escena) {
  if (R.puntos || !THREE) return;
  // los misiles, GRANDES y con cabeza caliente (a 480x270 un misil real es un pixel: no se veia);
  // las balas y trazadoras, chicas
  R.puntos = capa('puntos', 2); R.grandes = capa('puntos', 6); R.lineas = capa('lineas');
  R.bombas = capa('puntos', 5); R.sombras = capa('puntos', 5);
  R.sombras.material.transparent = true; R.sombras.material.opacity = 0.55; R.sombras.renderOrder = 4;
  escena.add(R.lineas); escena.add(R.puntos); escena.add(R.grandes); escena.add(R.sombras); escena.add(R.bombas);
  // LA MIRA de la vista de arriba: cuatro esquinas naranjas adelante del avion (islas.js `mira`)
  const g = new THREE.BufferGeometry(), L = 4, E = 2.2, v = [];
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) v.push(sx * L, 0, sz * L, sx * (L - E), 0, sz * L, sx * L, 0, sz * L, sx * L, 0, sz * (L - E));
  v.push(-0.6, 0, 0, 0.6, 0, 0, 0, 0, -0.6, 0, 0, 0.6);
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3));
  R.mira = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xffa040, fog: false, depthTest: false, transparent: true }));
  R.mira.renderOrder = 7; R.mira.frustumCulled = false; R.mira.visible = false;
  escena.add(R.mira);
}

/** Un cuadro: `lista` = [{ k, p: {x,y,z}, c: {x,y,z} }] (islas.js `proyectiles`). */
export function frame(lista, visible, mira = null, zoom = 1) {
  if (!R.puntos) return;
  R.puntos.visible = R.grandes.visible = R.lineas.visible = R.bombas.visible = R.sombras.visible = visible;
  R.mira.visible = visible && !!mira;
  if (mira) {
    // (el tamaño va con el zoom: que se vea igual de grande en pantalla en los tres)
    R.mira.position.set(mira.x, mira.y, mira.z); R.mira.rotation.set(0, -mira.yaw, 0); R.mira.scale.setScalar(zoom);
  }
  if (!visible) return;
  const capas = [R.puntos, R.grandes, R.bombas, R.sombras].map(o => ({ p: o.geometry.attributes.position, c: o.geometry.attributes.color, n: 0 }));
  const lp = R.lineas.geometry.attributes.position, lc = R.lineas.geometry.attributes.color;
  let nl = 0;
  const seg = (a, b, c, ka, kb) => {
    if (nl >= MAX * 2 - 2) return;
    lp.setXYZ(nl, a.x, a.y, a.z); lc.setXYZ(nl, c[0] * ka, c[1] * ka, c[2] * ka); nl++;
    lp.setXYZ(nl, b.x, b.y, b.z); lc.setXYZ(nl, c[0] * kb, c[1] * kb, c[2] * kb); nl++;
  };
  for (const q of lista) {
    if (q.k === 'bomba') {
      const B = capas[2], S = capas[3], a = Math.max(0, q.alto || 0);
      const sx = q.s.x + a * SOL_X, sz = q.s.z + a * SOL_Z;
      if (B.n < MAX) { B.p.setXYZ(B.n, q.p.x, q.p.y, q.p.z); B.c.setXYZ(B.n, BOMBA[0], BOMBA[1], BOMBA[2]); B.n++; }
      if (S.n < MAX) { S.p.setXYZ(S.n, sx, q.s.y, sz); S.c.setXYZ(S.n, SOMBRA[0], SOMBRA[1], SOMBRA[2]); S.n++; }
      seg(q.p, { x: sx, y: q.s.y, z: sz }, HILO, 0.5, 0.1);   // el hilo que une la bomba con su sombra
      continue;
    }
    const c = COLOR[q.k] || COLOR.misil, L = capas[GRANDE[q.k] ? 1 : 0];
    if (L.n >= MAX) continue;
    // la CABEZA del misil, casi blanca (el motor); la bala, de su color
    const h = GRANDE[q.k] ? CABEZA : c;
    L.p.setXYZ(L.n, q.p.x, q.p.y, q.p.z); L.c.setXYZ(L.n, h[0], h[1], h[2]); L.n++;
    if (q.h && q.h.length > 1) {
      // la estela de HUMO: del color del misil cerca de la cabeza a gris que se apaga
      for (let i = q.h.length - 1; i > 0; i--) {
        const k0 = i / q.h.length, k1 = (i - 1) / q.h.length;
        seg(q.h[i], q.h[i - 1], HUMO, 0.3 + 0.7 * k0, 0.3 + 0.7 * k1);
      }
      seg(q.p, q.h[q.h.length - 1], c, 1, 1);
    } else seg(q.p, q.c, c, 1, 0.4);
  }
  [R.puntos, R.grandes, R.bombas, R.sombras].forEach((o, i) => { o.geometry.setDrawRange(0, capas[i].n); capas[i].p.needsUpdate = capas[i].c.needsUpdate = true; });
  R.lineas.geometry.setDrawRange(0, nl);
  lp.needsUpdate = lc.needsUpdate = true;
}
