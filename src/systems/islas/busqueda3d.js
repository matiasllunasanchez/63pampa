// LA BUSQUEDA EN 3D (libro de vuelo r6, EL RESCATE DEL BELGRANO): dibuja lo que arma systems/islas/busqueda.js en el
// agua — la MANCHA DE ACEITE (una lamina oscura con brillo de arcoiris), los INDICIOS falsos (espuma, restos, un
// cajon, algas…), las BALSAS (naranjas, en racimo, que suben y bajan con las olas) y el HUMO de los marcadores (una
// columna que sube y se tuerce con el viento). Geometria propia y chica: no hay malla horneada todavia.
// EXAGERADO A PROPOSITO, como el pasillo: una balsa de 2 m vista desde 120 m es un punto.
const THREE = window.THREE || null;
const R = { g: null, mancha: null, ind: [], balsas: [], humos: [], tex: null };
const BALSA_K = 3.2, N_PUFF = 18, HUMO_ALTO = 200;

function texHumo() {
  if (R.tex) return R.tex;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  R.tex = new THREE.CanvasTexture(c);
  return R.tex;
}
function crear(escena) {
  R.g = new THREE.Group(); escena.add(R.g);
  // LA MANCHA: una lamina un poco arriba del agua, oscura y translucida
  const gm = new THREE.PlaneGeometry(1, 1); gm.rotateX(-Math.PI / 2);
  // (sin prueba de profundidad: el mar del temporal tiene olas de metros y la tapaba; va antes que las balsas)
  R.mancha = new THREE.Mesh(gm, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.03, 0.035, 0.03), transparent: true, opacity: 0.82, depthWrite: false, depthTest: false }));
  R.mancha.renderOrder = 2; R.mancha.visible = false; R.g.add(R.mancha);
  // el BRILLO del aceite: otra lamina mas angosta, verde-violeta
  const br = new THREE.Mesh(gm, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 0.3, 0.55), transparent: true, opacity: 0.4, depthWrite: false, depthTest: false }));
  br.scale.set(0.45, 1, 0.8); br.position.y = 0.05; br.renderOrder = 3; R.mancha.add(br);
}
function balsa() {
  const m = new THREE.Group();
  const casco = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.05, 0.45, 10), new THREE.MeshLambertMaterial({ color: new THREE.Color(1.0, 0.36, 0.05) }));
  const techo = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.9, 10), new THREE.MeshLambertMaterial({ color: new THREE.Color(0.95, 0.5, 0.1) }));
  techo.position.y = 0.6; m.add(casco); m.add(techo);
  m.scale.setScalar(BALSA_K); R.g.add(m);
  return m;
}
function indicio(t) {
  const plano = t.id === 'espuma' || t.id === 'algas';
  const geo = plano ? new THREE.CircleGeometry(0.5, 9).rotateX(-Math.PI / 2) : new THREE.BoxGeometry(1, 0.5, t.id === 'restos' ? 3 : 1);
  const mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(...t.c), transparent: plano, opacity: plano ? 0.8 : 1, depthTest: !plano, depthWrite: !plano });
  const m = new THREE.Mesh(geo, mat); m.scale.setScalar(t.t); m.renderOrder = plano ? 2 : 4; R.g.add(m);
  return m;
}
function humo() {
  const g = new THREE.Group();
  for (let i = 0; i < N_PUFF; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texHumo(), transparent: true, depthWrite: false,
      // (NARANJA, el humo de un marcador de rescate: el blanco se perdia entre la lluvia y las nubes)
      color: i < 2 ? new THREE.Color(1, 0.4, 0.05) : new THREE.Color(1, 0.55 + (i % 3) * 0.06, 0.22) }));
    s.renderOrder = 5; g.add(s);
  }
  R.g.add(g);
  return g;
}
const ajustar = (lista, n, fab) => { while (lista.length < n) lista.push(fab()); lista.forEach((m, i) => { m.visible = i < n; }); };

/** Un cuadro. `e` = busqueda.escena() (o null: se apaga todo). `t` el reloj, `viento` [x, z] m/s. */
export function frame(escena, e, t = 0, viento = [6, 0]) {
  if (!THREE) return;
  if (!R.g) crear(escena);
  R.g.visible = !!e;
  if (!e) return;
  // LA MANCHA
  const m = e.mancha;
  R.mancha.visible = !!m;
  if (m) {
    const L = Math.hypot(m.x1 - m.x0, m.z1 - m.z0);
    R.mancha.position.set((m.x0 + m.x1) / 2, 0.35, (m.z0 + m.z1) / 2);
    R.mancha.scale.set(m.ancho, 1, L);
    R.mancha.rotation.y = -m.rot;
  }
  // LOS INDICIOS (cada uno con su forma: se crean una vez por lista)
  if (R.ind.length !== e.ind.length) { R.ind.forEach(o => R.g.remove(o)); R.ind = e.ind.map(indicio); }
  e.ind.forEach((i, k) => { const o = R.ind[k]; o.position.set(i.x, 0.4 + Math.sin(t * 1.3 + k) * 0.3, i.z); o.rotation.y = i.rot; });
  // LAS BALSAS: suben y bajan con el mar
  const bl = e.balsas || [];
  ajustar(R.balsas, bl.length, balsa);
  bl.forEach((b, k) => { const o = R.balsas[k]; o.position.set(b.x, 0.6 + Math.sin(t * 1.7 + b.f) * 0.9, b.z); o.rotation.set(Math.sin(t * 1.1 + b.f) * 0.18, b.rot, Math.cos(t * 1.4 + b.f) * 0.15); });
  // EL HUMO: cada marcador, una columna que sube y se tuerce con el viento; se abre arriba
  ajustar(R.humos, e.humos.length, humo);
  e.humos.forEach((h, k) => {
    const g = R.humos[k], crece = Math.min(1, h.t / 6);
    g.position.set(h.x, 0, h.z);
    g.children.forEach((s, i) => {
      const u = ((i / N_PUFF) + t * 0.08) % 1, y = u * HUMO_ALTO * crece;
      s.position.set(viento[0] * u * 9, y + 1, viento[1] * u * 9);
      const r = 9 + u * 46;
      s.scale.set(r, r, 1);
      s.material.opacity = (i < 2 ? 1 : 0.85 * (1 - u * 0.8)) * crece;
    });
  });
}
