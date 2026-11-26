// LA BUSQUEDA EN 3D (libro de vuelo r6, EL RESCATE DEL BELGRANO): dibuja lo que arma systems/islas/busqueda.js en el
// agua — la MANCHA DE ACEITE (una lamina oscura con brillo de arcoiris), los INDICIOS falsos (espuma, restos, un
// cajon, algas…), las BALSAS (naranjas, en racimo, que suben y bajan con las olas) y el HUMO de los marcadores (una
// columna que sube y se tuerce con el viento). La mancha, los indicios y el humo son geometria propia y chica.
// LAS BALSAS, HORNEADAS (25/11, el autor: "botes con carpitas naranjas… horneálos por separado así los podemos repartir
// en todo alrededor"): la balsa autoinflable de las fotos —dos tubos, la carpa en cupula con su arco y la entrada con
// naufragos— sale de Blender (tools/blender/modelos_rescate.py → assets/mallas/balsa_salvavidas.js) y se dibuja como el
// avion (avion3d.js `grupoDe`). Mientras la malla no llega, la balsa provisoria de antes.
// EXAGERADO A PROPOSITO, como el pasillo: una balsa de 2 m vista desde 120 m es un punto.
import * as avion3d from './avion3d.js';
const THREE = window.THREE || null;
const R = { g: null, mancha: null, ind: [], balsas: [], humos: [], beng: [], circ: [], tex: null, texMancha: null, texLuz: null };
const BALSA_K = 3.2, N_PUFF = 18, HUMO_ALTO = 200;
const BALSA_MALLA = 'balsa_salvavidas', BALSA_MALLA_K = 2.4;   // (la horneada mide 2,8 m de punta a punta: 2,4 la deja como la de antes)

function texHumo() {
  if (R.tex) return R.tex;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  R.tex = new THREE.CanvasTexture(c);
  return R.tex;
}
/** LA MANCHA DE ACEITE con forma (26/11, el autor: "veo una parte rectangular que parece una pista de aterrizaje"): una
 *  textura con el borde deshilachado —ruido sobre una elipse alargada—, el negro del aceite y vetas de brillo tornasol. */
function texMancha() {
  if (R.texMancha) return R.texMancha;
  const N = 128, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'), img = g.createImageData(N, N);
  const h = (i, j, s) => { const v = Math.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };
  const ruido = (x, y, s) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = h(xi, yi, s), b = h(xi + 1, yi, s), cc = h(xi, yi + 1, s), d = h(xi + 1, yi + 1, s);
    return a + (b - a) * u + (cc - a) * v + (a - b - cc + d) * u * v;
  };
  const fbm = (x, y, s) => ruido(x, y, s) * 0.55 + ruido(x * 2.1, y * 2.1, s + 1) * 0.3 + ruido(x * 4.3, y * 4.3, s + 2) * 0.15;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x / N * 2 - 1, v = y / N * 2 - 1;
    // la elipse, mas ancha adelante (donde se derramo) y afinandose hacia la punta que deriva
    const ancho = 0.55 + 0.4 * (1 - (v + 1) / 2);
    const d = Math.hypot(u / ancho, v) + (fbm(x / 14, y / 14, 3) - 0.5) * 0.7;
    const i = (y * N + x) * 4;
    if (d > 0.95) { img.data[i + 3] = 0; continue; }
    const borde = Math.min(1, (0.95 - d) / 0.25);
    // el aceite, casi negro; las VETAS tornasol donde el ruido corta bandas finas
    const veta = Math.abs(Math.sin(fbm(x / 9, y / 22, 7) * 18)) < 0.18;
    const k = fbm(x / 6, y / 6, 9);
    const col = veta ? [52 + k * 30, 58 + k * 30, 72 + k * 40] : [4 + k * 8, 5 + k * 8, 4 + k * 6];
    img.data[i] = col[0]; img.data[i + 1] = col[1]; img.data[i + 2] = col[2];
    img.data[i + 3] = Math.round(255 * borde * (veta ? 0.75 : 0.95));
  }
  g.putImageData(img, 0, 0);
  R.texMancha = new THREE.CanvasTexture(c);
  R.texMancha.magFilter = THREE.NearestFilter;
  return R.texMancha;
}
/** La LUZ de una bengala: un punto blanco con halo rojo (se suma: brilla en el temporal). */
function texLuz() {
  if (R.texLuz) return R.texLuz;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 1, 32, 32, 31);
  gr.addColorStop(0, 'rgba(255,255,240,1)'); gr.addColorStop(0.12, 'rgba(255,210,150,1)'); gr.addColorStop(0.35, 'rgba(255,70,30,0.55)');
  gr.addColorStop(1, 'rgba(255,40,20,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  R.texLuz = new THREE.CanvasTexture(c);
  return R.texLuz;
}
// LAS BENGALAS (26/11, busqueda.js): cada una cae colgada de su paracaidas desde BENG_ALTO, se apaga al tocar el agua y
// otra arranca arriba; la luz se ve de lejos (sin niebla), con un hilo de humo arriba
// (la LUZ va a tamaño FIJO en pantalla —`sizeAttenuation` apagado, BENG_LUZ en fraccion del alto—: a 5 km un sprite en
// metros era un puntito; asi se ve de lejos, que es para lo que esta)
const BENG_ALTO = 170, BENG_CAE = 22, BENG_LUZ = 0.08;
function bengala() {
  const g = new THREE.Group();
  const luz = new THREE.Sprite(new THREE.SpriteMaterial({ map: texLuz(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, sizeAttenuation: false }));
  luz.scale.set(BENG_LUZ, BENG_LUZ, 1); luz.renderOrder = 6; g.add(luz);
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texHumo(), transparent: true, depthWrite: false, color: new THREE.Color(0.85, 0.8, 0.78) }));
    s.renderOrder = 5; g.add(s);
  }
  R.g.add(g);
  return g;
}
function crear(escena) {
  R.g = new THREE.Group(); escena.add(R.g);
  // LA MANCHA: una lamina un poco arriba del agua, oscura y translucida
  const gm = new THREE.PlaneGeometry(1, 1); gm.rotateX(-Math.PI / 2);
  // (sin prueba de profundidad: el mar del temporal tiene olas de metros y la tapaba; va antes que las balsas)
  // (con forma y vetas: la textura de `texMancha` — antes un rectangulo negro, que se leia como una pista)
  R.mancha = new THREE.Mesh(gm, new THREE.MeshBasicMaterial({ map: texMancha(), transparent: true, depthWrite: false, depthTest: false }));
  R.mancha.renderOrder = 2; R.mancha.visible = false; R.g.add(R.mancha);
}
function balsa() {
  const m = new THREE.Group();
  const casco = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.05, 0.45, 10), new THREE.MeshLambertMaterial({ color: new THREE.Color(1.0, 0.36, 0.05) }));
  const techo = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.9, 10), new THREE.MeshLambertMaterial({ color: new THREE.Color(0.95, 0.5, 0.1) }));
  techo.position.y = 0.6; m.add(casco); m.add(techo);
  m.scale.setScalar(BALSA_K); R.g.add(m);
  m.userData.prov = true;
  return m;
}
/** Cambia la balsa provisoria por la horneada apenas llega la malla (avion3d la pide la primera vez). */
function horneada(m) {
  if (!m.userData.prov) return;
  const g = avion3d.grupoDe(BALSA_MALLA);
  if (!g) return;
  while (m.children.length) m.remove(m.children[0]);
  g.scale.setScalar(BALSA_MALLA_K / BALSA_K); m.add(g); m.userData.prov = false;
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
      // (VERDE desde el 26/11, el autor: "una bengala que larga humo VERDE o blanco": el blanco se perdia entre la lluvia y
      // las nubes, y el naranja de antes se confundia con las bengalas)
      color: i < 2 ? new THREE.Color(0.2, 1, 0.35) : new THREE.Color(0.35, 0.95 + (i % 3) * 0.02, 0.45) }));
    s.renderOrder = 5; g.add(s);
  }
  R.g.add(g);
  return g;
}
// EL CIRCULO DONDE TIRAR EL HUMO (26/11, el autor: "que haya una zona clara aceptable para tirar el humo"): un anillo
// verde sobre el agua alrededor de cada grupo visto sin marcar, del radio en que el humo lo marca (BUSQ.MARCA); sin prueba
// de profundidad, para que las olas del temporal no lo tapen
// …Y LA CUPULA (26/11, el autor: "una cupula grande como la de la zona de disparo del buque, para marcar la zona y si el
// jugador se va, saber donde tiene que volver… asi en las 3 zonas"): media esfera de malla verde sobre el anillo
function circulo() {
  const g = new THREE.Group();
  const gm = new THREE.RingGeometry(0.93, 1, 64); gm.rotateX(-Math.PI / 2);
  const anillo = new THREE.Mesh(gm, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 1, 0.45), transparent: true, opacity: 0.8, depthTest: false, depthWrite: false }));
  anillo.renderOrder = 4; g.add(anillo);
  // (26/11, el autor: "la zona verde es demasiado obvia, mas sutil"): menos gajos y casi transparente
  const cupula = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 5, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 1, 0.45), wireframe: true, transparent: true, opacity: 0.09, depthWrite: false, fog: false }));
  cupula.renderOrder = 3; g.add(cupula);
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
  // LAS BENGALAS: las vivas caen y brillan; las barridas sin contacto, apagadas
  const bs = e.bengalas || [];
  ajustar(R.beng, bs.length, bengala);
  bs.forEach((q, k) => {
    const g = R.beng[k];
    g.visible = q.viva;
    if (!q.viva) return;
    const ciclo = BENG_ALTO / BENG_CAE, u = ((t + q.f) % ciclo) / ciclo, y = BENG_ALTO * (1 - u);
    g.position.set(q.x + Math.sin(t * 0.7 + k) * 8, 0, q.z);
    const [luz, ...humo] = g.children;
    luz.position.set(0, y, 0);
    const parpadeo = 0.85 + 0.15 * Math.sin(t * 23 + k * 3);
    luz.scale.set(BENG_LUZ * parpadeo, BENG_LUZ * parpadeo, 1);
    humo.forEach((s, i) => { const yy = y + 6 + i * 9; s.position.set(viento[0] * i * 1.4, yy, viento[1] * i * 1.4); const r = 6 + i * 4; s.scale.set(r, r, 1); s.material.opacity = 0.5 * (1 - i / 6); });
  });
  // LOS INDICIOS (cada uno con su forma: se crean una vez por lista)
  if (R.ind.length !== e.ind.length) { R.ind.forEach(o => R.g.remove(o)); R.ind = e.ind.map(indicio); }
  e.ind.forEach((i, k) => { const o = R.ind[k]; o.position.set(i.x, 0.4 + Math.sin(t * 1.3 + k) * 0.3, i.z); o.rotation.y = i.rot; });
  // LOS CIRCULOS del humo (late suave)
  const cs = e.circulos || [];
  ajustar(R.circ, cs.length, circulo);
  cs.forEach((c, k) => { const o = R.circ[k]; o.position.set(c.x, 0.5, c.z); o.scale.set(c.r, c.r, c.r); o.children[0].material.opacity = 0.3 + 0.15 * Math.sin(t * 3); });
  // LAS BALSAS: suben y bajan con el mar
  const bl = e.balsas || [];
  ajustar(R.balsas, bl.length, balsa);
  bl.forEach((b, k) => { const o = R.balsas[k]; horneada(o); o.position.set(b.x, 0.6 + Math.sin(t * 1.7 + b.f) * 0.9, b.z); o.rotation.set(Math.sin(t * 1.1 + b.f) * 0.18, b.rot, Math.cos(t * 1.4 + b.f) * 0.15); });
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
