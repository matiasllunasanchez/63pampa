// LAS ISLAS REALES — LAS EXPLOSIONES EN 3D (19/11, el autor: "mejora las explosiones, el avion debe explotar en
// todas las camaras tambien").
//
// Las del pasillo son de PANTALLA (core/fx.js `explodeAt`, con `proj`): caen bien en la vista de atras, pero
// desde arriba no existian. Estas viven EN EL MAPA y las ve cualquier camara: un FOGONAZO, la BOLA DE FUEGO
// (varias bolas que crecen y se apagan de amarillo a rojo), los PEDAZOS que vuelan con gravedad y rebotan
// contra el suelo, y el HUMO que sube y se abre. El agua: una columna blanca en vez de fuego.
// La cola de estallidos la llena systems/islas/islas.js (`estallido`, `estallarAvion`); three-arena.js la pasa.
const THREE = window.THREE || null;
const N_BOLA = 96, N_PED = 400;
const R = { bolas: [], ped: null, pedV: [], tex: null, vivos: [] };

function textura() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); return t;
}

export function crear(escena) {
  if (R.ped || !THREE) return;
  R.tex = textura();
  for (let i = 0; i < N_BOLA; i++) {
    const m = new THREE.SpriteMaterial({ map: R.tex, transparent: true, depthWrite: false, fog: false });
    const s = new THREE.Sprite(m); s.visible = false; s.renderOrder = 6; s.userData.v = null;
    escena.add(s); R.bolas.push(s);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N_PED * 3), 3));
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N_PED * 3), 3));
  g.setDrawRange(0, 0);
  R.ped = new THREE.Points(g, new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, vertexColors: true, fog: false }));
  R.ped.frustumCulled = false; R.ped.renderOrder = 6;
  escena.add(R.ped);
}

const rnd = (a, b) => a + Math.random() * (b - a);
let ib = 0;
function bola(o) {
  const s = R.bolas[ib]; ib = (ib + 1) % N_BOLA;
  s.userData.v = o; s.visible = false;
  s.material.blending = o.suma ? THREE.AdditiveBlending : THREE.NormalBlending;
}

/** Un estallido nuevo: { x, y, z, esc, tipo: 'fuego' | 'avion' | 'agua', vx, vz } (la inercia: m/s). */
function nuevo(e) {
  const k = e.esc || 1, agua = e.tipo === 'agua';
  if (!agua) {
    // EL FOGONAZO: blanco, enorme y cortito
    bola({ x: e.x, y: e.y + 2, z: e.z, vx: 0, vy: 0, vz: 0, t: 0, d: 0, vida: 0.18, r0: 22 * k, r1: 34 * k, c0: [1, 1, 0.9], c1: [1, 0.8, 0.4], a0: 1, a1: 0, suma: true });
    // LA BOLA DE FUEGO: bolas que nacen escalonadas, crecen y viran de amarillo a rojo oscuro
    for (let i = 0; i < 10; i++) bola({ x: e.x + rnd(-4, 4) * k, y: e.y + rnd(0, 5) * k, z: e.z + rnd(-4, 4) * k,
      vx: (e.vx || 0) * 0.6 + rnd(-6, 6) * k, vy: rnd(2, 9) * k, vz: (e.vz || 0) * 0.6 + rnd(-6, 6) * k, t: 0, d: i * 0.04, vida: rnd(0.7, 1.2),
      r0: rnd(4, 7) * k, r1: rnd(14, 22) * k, c0: [1, 0.92, 0.55], c1: [0.75, 0.18, 0.04], a0: 1, a1: 0, suma: true });
  }
  // EL HUMO (o el ROCIO, en el agua): sube, se abre y se apaga despacio
  for (let i = 0; i < (agua ? 8 : 9); i++) bola({ x: e.x + rnd(-5, 5) * k, y: e.y + rnd(2, 8) * k, z: e.z + rnd(-5, 5) * k,
    vx: (e.vx || 0) * 0.3 + rnd(-2, 2), vy: agua ? rnd(10, 22) * k : rnd(3, 7), vz: (e.vz || 0) * 0.3 + rnd(-2, 2), t: 0, d: agua ? i * 0.03 : 0.2 + i * 0.07,
    vida: agua ? rnd(1, 1.6) : rnd(2.4, 3.6), r0: rnd(5, 9) * k, r1: rnd(20, 34) * k,
    c0: agua ? [0.95, 0.97, 1] : [0.32, 0.28, 0.25], c1: agua ? [0.8, 0.85, 0.88] : [0.5, 0.5, 0.5], a0: agua ? 0.9 : 0.75, a1: 0, suma: false, g: agua ? 14 : 0 });
  // LOS PEDAZOS: chispas y restos que vuelan con la inercia, caen y rebotan
  const n = Math.round((e.tipo === 'avion' ? 70 : agua ? 30 : 45) * Math.min(1.6, k));
  for (let i = 0; i < n && R.pedV.length < N_PED; i++) {
    const a = rnd(0, 6.283), v = rnd(12, 48) * Math.sqrt(k);
    R.pedV.push({ x: e.x, y: e.y + 1, z: e.z, vx: Math.cos(a) * v + (e.vx || 0) * 0.8, vy: rnd(8, 34) * Math.sqrt(k), vz: Math.sin(a) * v + (e.vz || 0) * 0.8,
      t: 0, vida: rnd(0.8, 2.2), c: agua ? [0.9, 0.95, 1] : Math.random() < 0.6 ? [1, 0.7, 0.25] : [0.25, 0.22, 0.2] });
  }
}

/** Un cuadro: `nuevos` = la cola de islas.js; `suelo(x, z)` para el rebote; `dt` en s. */
export function frame(nuevos, dt, suelo) {
  if (!R.ped) return;
  for (const e of nuevos) nuevo(e);
  for (const s of R.bolas) {
    const o = s.userData.v; if (!o) continue;
    o.t += dt;
    if (o.t < o.d) { s.visible = false; continue; }
    const u = (o.t - o.d) / o.vida;
    if (u >= 1) { s.userData.v = null; s.visible = false; continue; }
    const fr = Math.exp(-dt * 1.6);
    o.vx *= fr; o.vz *= fr; o.vy = o.vy * fr - (o.g || 0) * dt;
    o.x += o.vx * dt; o.y += o.vy * dt; o.z += o.vz * dt;
    const e = 1 - Math.pow(1 - u, 2), r = o.r0 + (o.r1 - o.r0) * e;
    s.position.set(o.x, o.y, o.z); s.scale.set(r, r, 1);
    s.material.color.setRGB(o.c0[0] + (o.c1[0] - o.c0[0]) * u, o.c0[1] + (o.c1[1] - o.c0[1]) * u, o.c0[2] + (o.c1[2] - o.c0[2]) * u);
    s.material.opacity = o.a0 + (o.a1 - o.a0) * u;
    s.visible = true;
  }
  const P = R.ped.geometry.attributes.position, C = R.ped.geometry.attributes.color;
  let n = 0;
  for (let i = R.pedV.length - 1; i >= 0; i--) {
    const p = R.pedV[i];
    p.t += dt;
    if (p.t >= p.vida) { R.pedV.splice(i, 1); continue; }
    p.vy -= 22 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    const h = suelo(p.x, p.z);
    if (p.y < h) { p.y = h; p.vy = Math.abs(p.vy) * 0.3; p.vx *= 0.5; p.vz *= 0.5; }
    const f = 1 - p.t / p.vida;
    P.setXYZ(n, p.x, p.y, p.z); C.setXYZ(n, p.c[0] * f, p.c[1] * f, p.c[2] * f); n++;
  }
  R.ped.geometry.setDrawRange(0, n);
  P.needsUpdate = C.needsUpdate = true;
}

/** Fuera de las islas: todo apagado (y la cola vieja, descartada). */
export function apagar() {
  if (!R.ped) return;
  for (const s of R.bolas) { s.visible = false; s.userData.v = null; }
  R.pedV.length = 0; R.ped.geometry.setDrawRange(0, 0);
}
if (typeof window !== 'undefined') window.__est3d = () => JSON.stringify({ bolas: R.bolas.filter(s => s.visible).map(s => [s.position.x | 0, s.position.y | 0, s.position.z | 0, s.scale.x | 0]).slice(0, 3), ped: R.pedV.length });
