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

// LOS MISILES BUENOS (20/11, el autor: "los misiles deben ser BUENOS visualmente, hoy son cuadrados, y deben
// provenir de diversas zonas de donde salgan humo"): la cabeza es un PUNTO REDONDO con halo (no el cuadrado de
// PointsMaterial), y detras queda una ESTELA DE HUMO de bocanadas que se quedan en el aire donde paso el misil —
// crecen y se apagan en HUMO_VIDA s—, mas una NUBE en el punto de lanzamiento. Asi se lee de donde salio.
let TEX = null;
function texRedonda() {
  if (TEX) return TEX;
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
  TEX = new THREE.CanvasTexture(c);
  return TEX;
}
const HUMO_MAX = 2400, HUMO_VIDA = 5.5, HUMO_PASO = 7;
const H = { obj: null, pos: null, tam: null, alfa: null, p: [], t: 0, ult: new WeakMap() };
function crearHumo(escena) {
  const g = new THREE.BufferGeometry();
  H.pos = new THREE.BufferAttribute(new Float32Array(HUMO_MAX * 3), 3);
  H.tam = new THREE.BufferAttribute(new Float32Array(HUMO_MAX), 1);
  H.alfa = new THREE.BufferAttribute(new Float32Array(HUMO_MAX), 1);
  g.setAttribute('position', H.pos); g.setAttribute('aTam', H.tam); g.setAttribute('aAlfa', H.alfa);
  g.setDrawRange(0, 0);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false,
    uniforms: { uMedio: { value: 300 }, uTex: { value: texRedonda() } },
    vertexShader: `attribute float aTam; attribute float aAlfa; varying float vA; uniform float uMedio;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vA = aAlfa;
        gl_PointSize = clamp(aTam * projectionMatrix[1][1] * uMedio / max(-mv.z, 1.0), 1.0, 160.0);
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D uTex; varying float vA;
      void main() { float a = texture2D(uTex, gl_PointCoord).a * vA; if (a < 0.02) discard;
        gl_FragColor = vec4(vec3(0.78, 0.78, 0.76), a); }`,
  });
  H.obj = new THREE.Points(g, mat);
  H.obj.frustumCulled = false; H.obj.renderOrder = 4;
  escena.add(H.obj);
}
function bocanada(x, y, z, tam, crece, vida) {
  if (H.p.length >= HUMO_MAX) H.p.shift();
  H.p.push({ x, y, z, t0: H.t, tam, crece, vida });
}

function capa(tipo, tam) {
  const g = new THREE.BufferGeometry();
  const n = tipo === 'puntos' ? MAX : MAX * 2;
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setDrawRange(0, 0);
  const o = tipo === 'puntos'
    ? new THREE.Points(g, new THREE.PointsMaterial({ size: tam, sizeAttenuation: false, vertexColors: true, fog: false,
        map: texRedonda(), transparent: true, alphaTest: 0.05, depthWrite: false }))
    : new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, fog: false, transparent: true, opacity: 0.7 }));
  o.frustumCulled = false; o.renderOrder = 5;
  return o;
}

export function crear(escena) {
  if (R.puntos || !THREE) return;
  // los misiles, GRANDES y con cabeza caliente (a 480x270 un misil real es un pixel: no se veia);
  // las balas y trazadoras, chicas
  R.puntos = capa('puntos', 3); R.grandes = capa('puntos', 7); R.lineas = capa('lineas');
  // el HALO del motor: un punto grande, naranja y sumado
  R.halos = capa('puntos', 18); R.halos.material.blending = THREE.AdditiveBlending; R.halos.material.opacity = 0.55;
  escena.add(R.halos); crearHumo(escena);
  // (21/11, el autor: "la bomba en ISLA no se ve: tiene que verse claramente cuando cae"): casi el doble, y una estela
  R.bombas = capa('puntos', 9); R.sombras = capa('puntos', 6);
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
export function frame(lista, visible, mira = null, zoom = 1, dt = 1 / 60, medio = 300) {
  if (!R.puntos) return;
  H.t += dt; H.obj.material.uniforms.uMedio.value = medio;
  R.halos.visible = H.obj.visible = visible;
  R.puntos.visible = R.grandes.visible = R.lineas.visible = R.bombas.visible = R.sombras.visible = visible;
  R.mira.visible = visible && !!mira;
  if (mira) {
    // (el tamaño va con el zoom: que se vea igual de grande en pantalla en los tres)
    R.mira.position.set(mira.x, mira.y, mira.z); R.mira.rotation.set(0, -mira.yaw, 0); R.mira.scale.setScalar(zoom);
  }
  if (!visible) return;
  const capas = [R.puntos, R.grandes, R.bombas, R.sombras, R.halos].map(o => ({ p: o.geometry.attributes.position, c: o.geometry.attributes.color, n: 0 }));
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
      // LA ESTELA: un trazo corto hacia arriba (de donde viene cayendo), claro arriba y apagado abajo
      seg({ x: q.p.x, y: q.p.y + Math.min(25, 4 + a * 0.15), z: q.p.z }, q.p, BOMBA, 0.15, 0.9);
      continue;
    }
    const c = COLOR[q.k] || COLOR.misil, L = capas[GRANDE[q.k] ? 1 : 0];
    if (L.n >= MAX) continue;
    // la CABEZA del misil, casi blanca (el motor); la bala, de su color
    const h = GRANDE[q.k] ? CABEZA : c;
    L.p.setXYZ(L.n, q.p.x, q.p.y, q.p.z); L.c.setXYZ(L.n, h[0], h[1], h[2]); L.n++;
    if (GRANDE[q.k]) {
      const Hl = capas[4];
      if (Hl.n < MAX) { Hl.p.setXYZ(Hl.n, q.p.x, q.p.y, q.p.z); Hl.c.setXYZ(Hl.n, c[0], c[1] * 0.8, c[2] * 0.6); Hl.n++; }
      // EL HUMO: la nube del lanzamiento la primera vez que se lo ve, y despues una bocanada cada HUMO_PASO m
      const llave = q.h || q;
      const u = H.ult.get(llave);
      if (!u) {
        for (let i = 0; i < 9; i++) bocanada(q.p.x + (Math.random() - 0.5) * 8, q.p.y + Math.random() * 4, q.p.z + (Math.random() - 0.5) * 8, 7 + Math.random() * 6, 2.2, 7);
        H.ult.set(llave, { x: q.p.x, y: q.p.y, z: q.p.z });
      } else {
        const d = Math.hypot(q.p.x - u.x, q.p.y - u.y, q.p.z - u.z);
        if (d > 300) { u.x = q.p.x; u.y = q.p.y; u.z = q.p.z; }   // (un salto: el carril se rehizo)
        else for (let k = Math.floor(d / HUMO_PASO); k > 0; k--) {
          const f = k * HUMO_PASO / d;
          bocanada(q.p.x + (u.x - q.p.x) * f, q.p.y + (u.y - q.p.y) * f, q.p.z + (u.z - q.p.z) * f, 2.2 + Math.random(), 1.6, HUMO_VIDA);
          if (k === 1) { u.x = q.p.x; u.y = q.p.y; u.z = q.p.z; }
        }
      }
      seg(q.p, q.c, c, 1, 0.2);   // la llama, corta
    } else seg(q.p, q.c, c, 1, 0.4);
  }
  // las bocanadas: crecen y se apagan (las viejas salen de la lista)
  while (H.p.length && H.t - H.p[0].t0 > H.p[0].vida) H.p.shift();
  for (let i = 0; i < H.p.length; i++) {
    const b = H.p[i], u = (H.t - b.t0) / b.vida;
    H.pos.setXYZ(i, b.x, b.y + u * 6, b.z); H.tam.setX(i, b.tam * (1 + u * b.crece)); H.alfa.setX(i, 0.55 * (1 - u) * (1 - u));
  }
  H.obj.geometry.setDrawRange(0, H.p.length);
  H.pos.needsUpdate = H.tam.needsUpdate = H.alfa.needsUpdate = true;
  [R.puntos, R.grandes, R.bombas, R.sombras, R.halos].forEach((o, i) => { o.geometry.setDrawRange(0, capas[i].n); capas[i].p.needsUpdate = capas[i].c.needsUpdate = true; });
  R.lineas.geometry.setDrawRange(0, nl);
  lp.needsUpdate = lc.needsUpdate = true;
}
