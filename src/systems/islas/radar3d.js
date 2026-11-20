// LAS ISLAS REALES — LA RED DEL RADAR EN 3D (20/11, el autor: "los radares de forma radial deben mostrarse igual
// que en pasillo, saliendo desde el centro de donde este").
//
// En el pasillo el radar es una RED verde a la altura del techo (render/world.js `drawRadarNet`): abajo no te ve,
// arriba si, y un frente de barrido la recorre. Sobre el mapa real el techo es RADAR_BAJO metros SOBRE EL SUELO
// (data/islas_teatro.js), asi que la red copia el relieve, y es RADIAL: anillos alrededor del radar y rayos que
// salen de el, con ondas que nacen en el centro y se van para afuera. Se ve la del radar en cuya zona estas
// (el de ellos en verde, como el del pasillo; el nuestro, celeste), y solo cerca tuyo: se desvanece de lejos.
// Los datos: islas.js `radaresEscena` (teatro.js `radares` y `zona`).
const THREE = window.THREE || null;
const ANILLO = 1000;      // m entre anillos
const PASO = 300;         // m de cada tramo (la red sigue el relieve de a tramos cortos)
const RAYOS = 48;
const ONDA_V = 3000, ONDA_CADA = 6000;   // las ondas que salen del centro: velocidad y separacion (m)
const VE = [2500, 7000];  // se ve entera hasta VE[0] de la camara y se apaga a VE[1]
const COL = { gb: [0.35, 1.0, 0.45], arg: [0.55, 0.82, 1.0] };
const R = {};             // nombre → { obj, mat, k }
let t = 0;

function armar(scene, r, alt, suelo) {
  const pos = [], rc = [];
  const punto = (dx, dz) => { pos.push(dx, Math.max(suelo(r.x + dx, r.z + dz), 0) + alt, dz); rc.push(Math.hypot(dx, dz)); };
  const tramo = (a, b) => { punto(a[0], a[1]); punto(b[0], b[1]); };
  for (let d = ANILLO; d <= r.r; d += ANILLO) {
    const n = Math.max(48, Math.ceil(2 * Math.PI * d / PASO));
    for (let i = 0; i < n; i++) {
      const a0 = i / n * 2 * Math.PI, a1 = (i + 1) / n * 2 * Math.PI;
      tramo([Math.cos(a0) * d, Math.sin(a0) * d], [Math.cos(a1) * d, Math.sin(a1) * d]);
    }
  }
  for (let k = 0; k < RAYOS; k++) {
    const a = k / RAYOS * 2 * Math.PI, c = Math.cos(a), s = Math.sin(a);
    for (let d = 0; d < r.r; d += PASO) tramo([c * d, s * d], [c * Math.min(d + PASO, r.r), s * Math.min(d + PASO, r.r)]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('rc', new THREE.BufferAttribute(new Float32Array(rc), 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false,
    uniforms: { uCam: { value: new THREE.Vector3() }, uCol: { value: new THREE.Color(...COL[r.bando]) },
      uOp: { value: 0 }, uT: { value: 0 }, uR: { value: r.r } },
    vertexShader: `attribute float rc; varying float vRc; varying vec3 vW;
      void main() { vRc = rc; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform vec3 uCam; uniform vec3 uCol; uniform float uOp; uniform float uT; uniform float uR;
      varying float vRc; varying vec3 vW;
      void main() {
        float lejos = 1.0 - smoothstep(${VE[0]}.0, ${VE[1]}.0, distance(vW.xz, uCam.xz));
        float d = mod(vRc - uT * ${ONDA_V}.0, ${ONDA_CADA}.0);
        float onda = exp(-d * d / 90000.0) + exp(-(${ONDA_CADA}.0 - d) * (${ONDA_CADA}.0 - d) / 90000.0);
        float borde = smoothstep(uR - 400.0, uR, vRc);
        float a = uOp * lejos * (0.28 + 0.9 * onda + 0.6 * borde);
        if (a < 0.01) discard;
        gl_FragColor = vec4(uCol * (1.0 + onda * 0.6), a);
      }`,
  });
  const obj = new THREE.LineSegments(g, mat);
  obj.frustumCulled = false; obj.renderOrder = 4;
  obj.position.set(r.x, 0, r.z);
  scene.add(obj);
  return { obj, mat, k: 0 };
}

/** Un cuadro. `E` = islas.js `radaresEscena()` ({ lista, zona, alt }) o null. */
export function frame(scene, E, cam, dt, suelo) {
  if (!THREE) return;
  t += dt;
  const lista = E ? E.lista : [];
  for (const r of lista) {
    const q = R[r.n] || (R[r.n] = armar(scene, r, E.alt, suelo));
    // (el radar de un buque va con el; la red se armo con el relieve de donde estaba: en el mar da igual)
    q.obj.position.set(r.x, 0, r.z);
    const dentro = E.zona && (E.zona.gb === r.n || E.zona.arg === r.n);
    q.k += ((dentro ? 1 : 0) - q.k) * Math.min(1, dt * 1.5);
    q.mat.uniforms.uOp.value = q.k * (r.bando === 'gb' && E.zona.visto ? 1 : 0.7);
    q.mat.uniforms.uT.value = t;
    q.mat.uniforms.uCam.value.copy(cam.position);
    q.obj.visible = q.k > 0.01;
  }
  // (el radar que ya no esta —un buque hundido— se apaga)
  for (const n in R) if (!lista.some(r => r.n === n)) R[n].obj.visible = false;
}

export function apagar() { for (const n in R) R[n].obj.visible = false; }
