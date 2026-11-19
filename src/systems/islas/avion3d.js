// LAS ISLAS REALES — EL AVION EN 3D (prototipo I0, docs/proyecto/ANALISIS_ISLAS_REALES.md).
//
// Pedido del autor (19/11): "usar la misma logica que se uso para armar el avioncito de Dusk Patrol, pero
// con los nuestros desde Blender". Es eso:
//   · LA MALLA es la nuestra: cada avion de tools/blender (los mismos modelos del selector y de las hojas),
//     bajado a ~2400 triangulos y con la pintura horneada a un color por cara. Los 26 aviones jugables y
//     las cuatro variantes de numeral de los cazas (tools/blender/exportar_mallas_todas.py →
//     assets/mallas/<clave>.js). Cada una se carga RECIEN cuando vuela (un <script>: anda por file://);
//   · EL DIBUJO es el de Dusk Patrol (render/shaders/mesh.js): luz de cielo cubierto en TRES tonos, la
//     niebla del terreno, el contorno oscuro de un pixel y la misma paleta con dither del terreno.
// El contorno es un casco invertido inflado UN PIXEL en pantalla (Dusk Patrol lo hace en su pasada final;
// aca no hay pasada final, y el casco da el mismo borde sin ella).
import { PALETA_GLSL, paletaUniform, suelo } from './terreno3d.js';

const THREE = window.THREE || null;

const VS = /* glsl */`
in vec3 position; in vec3 color; in vec3 normal;
uniform mat4 modelMatrix; uniform mat4 viewMatrix; uniform mat4 projectionMatrix;
out vec3 vW; out vec3 vN; out vec3 vC;
void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; vN = mat3(modelMatrix)*normal; vC = color;
  gl_Position = projectionMatrix*viewMatrix*w; }`;
const FS = /* glsl */`
precision highp float;
in vec3 vW; in vec3 vN; in vec3 vC;
uniform vec3 cameraPosition; uniform vec3 uSun; uniform vec3 uHaze;
uniform vec3 uPal[84];
out vec4 oCol;
${PALETA_GLSL}
void main(){
  vec3 n = normalize(vN); if (dot(n, cameraPosition - vW) < 0.0) n = -n;
  vec3 base = vC;
  float l = n.y*0.6 + dot(n, uSun)*0.4;   // cielo cubierto: la luz viene casi toda de arriba
  vec3 col = l > 0.3 ? base*vec3(1.04,1.04,1.02) : (l > -0.2 ? base*vec3(0.80,0.81,0.85) : base*vec3(0.56,0.57,0.66));
  float t = length(vW - cameraPosition);
  col = mix(col, uHaze, 1.0 - exp(-t*0.00032));
  oCol = vec4(paleta(col), 1.0);
}`;

// EL CONTORNO: las caras de atras, empujadas un pixel hacia afuera en pantalla, en el violeta casi negro
// del contorno de Dusk Patrol (post.js: 0.07, 0.047, 0.11)
const VS_BORDE = /* glsl */`
in vec3 position; in vec3 normal;
uniform mat4 modelMatrix; uniform mat4 viewMatrix; uniform mat4 projectionMatrix; uniform vec2 uRes;
void main(){
  vec4 c = projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.0);
  vec4 cn = projectionMatrix*viewMatrix*vec4(mat3(modelMatrix)*normal, 0.0);
  vec2 d = cn.xy; float l = length(d);
  if (l > 1e-5) c.xy += d/l * 2.0/uRes * c.w;
  gl_Position = c;
}`;
const FS_BORDE = /* glsl */`
precision highp float;
out vec4 oCol;
void main(){ oCol = vec4(0.07,0.047,0.11,1.0); }`;

const V = { glow: null, nucleo: null, luz: null, hilos: null, tips: null, tip: [[0, 0, 0], [0, 0, 0]], tob: [0, 0, 0], reactor: false, grupo: null, matBorde: null, mat: null, cuerpo: null, borde: null, clave: '', rotores: null, cargas: null, cargaKey: '' };
// LOS REACTORES (los que tienen tobera atras, en el eje): los de helice y los helicopteros no la llevan
const REACTORES = ['sky', 'a4q', 'dagger', 'mirage', 'supere', 'pampa', 'mb339'];
const ROTOR_W = 14;           // rad/s de las palas (de verdad son ~30; a 60 cuadros eso no se lee: parpadea)
const GEO = {}, PEDIDA = {};

/** La malla de `clave`, o null si todavia no llego (la pide la primera vez). */
function malla(clave) {
  if (GEO[clave]) return GEO[clave];
  const M = window.__MALLAS && window.__MALLAS[clave];
  if (M) { GEO[clave] = geometria(M); GEO[clave].userData.rotores = M.rotores || []; delete window.__MALLAS[clave]; return GEO[clave]; }
  if (!PEDIDA[clave]) {
    PEDIDA[clave] = true;
    const sc = document.createElement('script');
    sc.src = '../assets/mallas/' + clave + '.js';
    document.head.appendChild(sc);
  }
  return null;
}

function geometria(m) {
  const n = m.tris, pos = new Float32Array(m.pos), col = new Float32Array(n * 9);
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) col.set(m.col.slice(i * 3, i * 3 + 3), i * 9 + k * 3);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();                    // sin indices: cada triangulo tiene su normal (caras planas)
  // LA TOBERA: la boca del escape, en la cola (z maxima: la malla mira a −z), cerca del eje
  let zmax = -1e9; for (let i = 2; i < pos.length; i += 3) zmax = Math.max(zmax, pos[i]);
  let sy = 0, n2 = 0;
  for (let i = 0; i < pos.length; i += 3) if (pos[i + 2] > zmax - 0.6 && Math.abs(pos[i]) < 0.7) { sy += pos[i + 1]; n2++; }
  g.userData.tobera = [0, n2 ? sy / n2 : 0, zmax];
  // LAS PUNTAS DE ALA: el vertice mas afuera de cada lado (de ahi salen los vortices)
  let ix = 0; for (let i = 0; i < pos.length; i += 3) if (pos[i] > pos[ix]) ix = i;
  g.userData.puntas = [[-pos[ix], pos[ix + 1], pos[ix + 2]], [pos[ix], pos[ix + 1], pos[ix + 2]]];
  g.userData.envergadura = 2 * Math.abs(pos[ix]);
  return g;
}

/** Arma el avion la primera vez (los materiales y el grupo; la malla llega despues, por `frame`). */
export function crear(escena, sol) {
  if (V.grupo) return V.grupo;
  if (!THREE) return null;
  V.sol = sol;
  const g = new THREE.BufferGeometry();
  V.mat = new THREE.RawShaderMaterial({
    // DE LAS DOS CARAS: hay piezas de Blender con las caras al reves (el fuselaje del Hercules no se veia);
    // el shader ya da vuelta la normal hacia la camara
    glslVersion: THREE.GLSL3, vertexShader: VS, fragmentShader: FS, fog: false, side: THREE.DoubleSide,
    uniforms: { uSun: { value: new THREE.Vector3(...sol) }, uHaze: { value: new THREE.Vector3(0.60, 0.63, 0.67) }, uPal: paletaUniform() },
  });
  V.matBorde = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: VS_BORDE, fragmentShader: FS_BORDE, side: THREE.BackSide, fog: false,
    uniforms: { uRes: { value: new THREE.Vector2(480, 270) } },
  });
  const cuerpo = new THREE.Mesh(g, V.mat), borde = new THREE.Mesh(g, V.matBorde);
  V.cuerpo = cuerpo; V.borde = borde;
  borde.renderOrder = 1; cuerpo.renderOrder = 2;
  const grupo = new THREE.Group();
  grupo.add(borde); grupo.add(cuerpo);
  grupo.rotation.order = 'YXZ';
  escena.add(grupo);
  V.grupo = grupo;
  return grupo;
}

/** Pone el avion donde esta A (yaw 0 = norte, horario; la malla mira a −z). `clave` = la malla que vuela
 *  (el avion elegido, o la variante del numeral). Hasta que llega, se ve la que habia; si no habia ninguna,
 *  nada. */
export function frame(A, visible, res, clave, cargas, cam) {
  if (!V.grupo) return;
  colgar(clave, cargas);
  if (clave && clave !== V.clave) {
    const g = malla(clave);
    if (g) {
      V.cuerpo.geometry = g; V.borde.geometry = g; V.clave = clave; armarRotores(g.userData.rotores);
      V.tob = g.userData.tobera || [0, 0, 0];
      V.tip = g.userData.puntas || V.tip;
      V.reactor = REACTORES.includes(clave.replace(/^var_/, '').replace(/_\d$/, ''));
    }
  }
  // LAS PALAS GIRAN (como en las hojas de vuelo del pasillo): cada rotor para su lado
  if (V.rotores) V.rotores.children.forEach((r, i) => { r.rotation.y = (i % 2 ? -1 : 1) * performance.now() / 1000 * ROTOR_W; });
  V.grupo.visible = visible && !!V.clave;
  // la pose va SIEMPRE (aunque no se vea el avion, en la cabina): la sombra y el escape la leen
  V.grupo.position.set(A.pos.x, A.pos.y, A.pos.z);
  V.grupo.rotation.set(A.pitch, -A.yaw, -(A.roll || 0));
  if (res) V.matBorde.uniforms.uRes.value.set(res.x, res.y);
  escape(A, visible, cam);
  sombra(A);
}

/** LA SOMBRA (autor, 19/11: "la sombra debe coincidir con la figura"): la malla MISMA del avion —con su
 *  alabeo, su cabeceo, sus cargas— aplastada contra el terreno real en la direccion de la luz de Dusk Patrol
 *  (la del sol de mayo, empinada a proposito para la sombra: `uJSd` del terreno). Cada vertice baja hasta el
 *  suelo con la MISMA altura que marcha el terreno (`hgt`), asi que la sombra se dobla sobre las lomas.
 *  Oscurece lo que hay abajo multiplicando (no pinta un color): sobre la turba, sobre la playa y sobre el agua
 *  queda del tono de cada cosa, como la de Dusk Patrol. Dos triangulos encimados no la oscurecen dos veces:
 *  escribe profundidad y prueba con LESS. */
const OSCURO = 0.55;          // cuanto deja pasar la sombra (Dusk Patrol: la luz cae a la mitad)
function materialSombra(S, luz) {
  return new THREE.RawShaderMaterial({
    // (de las dos caras: aplastada contra el suelo, la mitad de los triangulos quedaba de espaldas)
    glslVersion: THREE.GLSL3, fog: false, depthWrite: true, depthFunc: THREE.LessDepth, side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.ZeroFactor, blendDst: THREE.SrcColorFactor,
    uniforms: Object.assign({ uL: { value: luz }, uK: { value: OSCURO } }, S.uniforms),
    vertexShader: `in vec3 position;
uniform mat4 modelMatrix; uniform mat4 viewMatrix; uniform mat4 projectionMatrix; uniform vec3 uL;
${S.glsl}
void main(){
  vec3 w = (modelMatrix*vec4(position,1.0)).xyz;
  // dos pasadas: bajar hasta el suelo de donde cae, y corregir con el suelo de donde cayo
  float t = (w.y - max(hgt(w.xz), 0.0))/uL.y; vec3 s = w - uL*t;
  t = (w.y - max(hgt(s.xz), 0.0))/uL.y; s = w - uL*t;
  s.y = max(hgt(s.xz), 0.0) + 0.15;
  gl_Position = projectionMatrix*viewMatrix*vec4(s,1.0);
}`,
    fragmentShader: `precision highp float; uniform float uK; out vec4 oCol; void main(){ oCol = vec4(vec3(uK), 1.0); }`,
  });
}
function sombra(A) {
  if (V.sombraMat === undefined) {
    const S = suelo();
    if (!S) return;
    const L = new THREE.Vector3(...V.sol).normalize();
    V.sombraMat = materialSombra(S, new THREE.Vector3(L.x * 0.5, 1, L.z * 0.5).normalize());
    V.sombra = new THREE.Group(); V.sombra.renderOrder = 1;
    V.grupo.parent.add(V.sombra);
  }
  if (!V.sombraMat) return;
  // las piezas que la proyectan: el cuerpo y las cargas (las palas de un rotor girando no hacen sombra)
  const piezas = [V.cuerpo].concat(V.cargas ? V.cargas.children.filter(m => m.material === V.mat) : []);
  if (V.sombra.children.length !== piezas.length || V.sombra.children.some((m, i) => m.geometry !== piezas[i].geometry)) {
    V.sombra.clear();
    for (const p of piezas) { const m = new THREE.Mesh(p.geometry, V.sombraMat); m.frustumCulled = false; V.sombra.add(m); }
  }
  // la sombra va con la pose del avion (el grupo), pero en el mundo: la proyeccion la hace el shader
  V.grupo.updateMatrixWorld();
  for (const m of V.sombra.children) { m.matrixAutoUpdate = false; m.matrix.copy(V.grupo.matrixWorld); m.matrixWorld.copy(V.grupo.matrixWorld); }
  // (solo cuando se ve la MALLA: en la vista pasillo vuela el sprite, que trae su propia sombra —render/plane.js
  // `drawShadow`—, y la de la malla a escala real salia gigante debajo)
  V.sombra.visible = !!V.clave && V.grupo.visible;
}

/** EL TURBO, COMO EN EL PASILLO (render/plane.js `tobera` y `tipTrail`; autor, 19/11: "era una iluminacion
 *  naranja como esta en pasillo — el juego debe sentirse igual en ambas versiones"):
 *   · SIN TURBO NO SE ILUMINA NADA: la tobera apagada ya viene en el modelo, con su color;
 *   · CON TURBO la boca se ENCIENDE: un resplandor naranja sin borde, un nucleo amarillo de un tercio del
 *     radio bien adentro, los dos latiendo con el pulso de la turbina, y la LUZ naranja que derrama alrededor
 *     (render/brillo.js `luz`). Entra con rampa. Se ve cuando la cola mira a la camara, como en el pasillo
 *     (que lo apaga si el sprite no muestra el caño);
 *   · LOS VORTICES DE PUNTA DE ALA: con el turbo suaves, con las piruetas fuertes; en el foam del pasillo
 *     cerca del ala y en el crest hacia la cola. Aca son la historia de las puntas EN EL MAPA.
 *  Sin humo de escape: el pasillo no lo tiene. */
const TIP_N = 60;
function gradiente(paradas) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  for (const [p, col] of paradas) g.addColorStop(p, col);
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
function sprite(tex) {
  const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const o = new THREE.Sprite(m); o.renderOrder = 4; o.visible = false;
  return o;
}
function hilo() {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TIP_N * 3), 3));
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(TIP_N * 3), 3));
  g.setDrawRange(0, 0);
  const o = new THREE.Line(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5, fog: false, depthWrite: false }));
  o.frustumCulled = false; o.renderOrder = 3;
  return o;
}
const _t = THREE ? new THREE.Vector3() : null, _c = THREE ? new THREE.Vector3() : null;
const lin = v => Math.pow(Math.max(0, v), 2.2);
const FOAM = [0xcf, 0xe3, 0xdf].map(v => lin(v / 255)), CREST = [0x7f, 0xa3, 0xa0].map(v => lin(v / 255));
function escape(A, visible, cam) {
  if (!V.glow) {
    const esc = V.grupo.parent;
    // los tres del pasillo: el resplandor (255,170,90 → 224,110,36), el nucleo (255,240,150 → 255,180,60)
    // y la luz que derrama (255,150,70)
    V.glow = sprite(gradiente([[0, 'rgba(255,170,90,0.34)'], [0.45, 'rgba(224,110,36,0.22)'], [1, 'rgba(180,70,22,0)']]));
    V.nucleo = sprite(gradiente([[0, 'rgba(255,240,150,0.75)'], [0.5, 'rgba(255,180,60,0.5)'], [1, 'rgba(240,120,30,0)']]));
    V.luz = sprite(gradiente([[0, 'rgba(255,150,70,1)'], [0.35, 'rgba(255,150,70,0.4)'], [1, 'rgba(255,150,70,0)']]));
    V.hilos = [hilo(), hilo()]; V.tips = [[], []];
    for (const o of [V.luz, V.glow, V.nucleo, ...V.hilos]) esc.add(o);
  }
  const f = A.turbo || 0;
  V.grupo.updateMatrixWorld();
  // LA BOCA: solo con turbo, en los reactores, y cuando la cola mira a la camara
  _t.set(V.tob[0], V.tob[1], V.tob[2] + 0.1); V.grupo.localToWorld(_t);
  let cara = 0;
  if (cam) { _c.copy(_t).sub(cam.position).normalize(); cara = Math.max(0, _c.x * A.fwd.x + _c.y * A.fwd.y + _c.z * A.fwd.z); }
  const k = f * Math.min(1, cara * 1.6);
  const on = visible && V.reactor && (A.motor ?? 1) > 0 && k > 0.01;
  for (const o of [V.glow, V.nucleo, V.luz]) o.visible = on;
  if (on) {
    const pulso = 0.86 + 0.10 * Math.sin(performance.now() / 1000 * 30) + Math.random() * 0.04;
    const R = (0.75 + f * 1.15) * pulso;            // ~ (3.2 + 5f) px del pasillo con el avion a escala
    for (const [o, r, a] of [[V.glow, R, k], [V.nucleo, R * 0.34, k], [V.luz, R * 2.6, 0.6 * k]]) {
      o.position.copy(_t); o.scale.set(r * 2, r * 2 * 0.72, 1); o.material.opacity = Math.min(1, a);
    }
  }
  // LOS VORTICES: fuerza = suave con turbo, fuerte en pirueta
  const fv = visible ? Math.max(f * 0.55, A.pirueta ? 1 : 0) : 0;
  V.tip.forEach((tp, lado) => {
    const h = V.tips[lado], o = V.hilos[lado];
    if (fv > 0.01) { _t.set(tp[0], tp[1], tp[2]); V.grupo.localToWorld(_t); h.push(_t.clone()); }
    else if (h.length) h.shift();
    while (h.length > TIP_N) h.shift();
    const gp = o.geometry.attributes.position, gc = o.geometry.attributes.color, n = h.length;
    for (let i = 0; i < n; i++) {
      const viejo = n > 1 ? 1 - i / (n - 1) : 0, c = viejo < 0.45 ? FOAM : CREST, a = (1 - viejo * 0.72);
      gp.setXYZ(i, h[i].x, h[i].y, h[i].z); gc.setXYZ(i, c[0] * a, c[1] * a, c[2] * a);
    }
    o.geometry.setDrawRange(0, n); gp.needsUpdate = gc.needsUpdate = true;
    o.material.opacity = 0.5 * (0.35 + Math.max(fv, 0.3) * 0.65);
  });
}

/** LA CARGA (data/cargas.js `capasDe`: 'carga_tanques_ala', 'carga_bomba_centro'…): cada capa es su propia
 *  malla (assets/mallas/<celula>__<capa>.js), del mismo modelo de Blender que el avion, y cuelga en el mismo
 *  lugar. Las variantes de numeral comparten las capas de su celula. Se rearma solo si cambia algo; las que
 *  todavia no llegaron entran en el cuadro en que llegan. */
function colgar(clave, cargas) {
  if (!clave || !V.grupo) return;
  const celula = clave.replace(/^var_/, '').replace(/_\d$/, '');
  const quiero = (cargas || []).map(n => celula + '__' + n.replace(/^carga_/, ''));
  const listas = quiero.filter(k => malla(k));
  const key = listas.join('|');
  if (key === V.cargaKey) return;
  V.cargaKey = key;
  if (V.cargas) V.grupo.remove(V.cargas);
  V.cargas = new THREE.Group();
  for (const k of listas) {
    const g = malla(k), m = new THREE.Mesh(g, V.mat), b = new THREE.Mesh(g, V.matBorde);
    b.renderOrder = 1; m.renderOrder = 2;
    V.cargas.add(b); V.cargas.add(m);
  }
  V.grupo.add(V.cargas);
}

/** LOS ROTORES de un helicoptero (assets/mallas: [x, y, z, radio, palas, cuerda] en metros): las palas
 *  como tablas planas oscuras, con la misma luz, paleta y contorno que el resto del avion. */
function armarRotores(lista) {
  if (V.rotores) { V.grupo.remove(V.rotores); V.rotores = null; }
  if (!lista || !lista.length) return;
  V.rotores = new THREE.Group();
  for (const [x, y, z, R, n, cuerda] of lista) {
    const eje = new THREE.Group(); eje.position.set(x, y, z);
    for (let i = 0; i < n; i++) {
      const g = new THREE.BoxGeometry(R, 0.06, Math.max(0.25, cuerda)).toNonIndexed();
      g.translate(R / 2, 0, 0);
      const c = new Float32Array(g.attributes.position.count * 3).fill(0.2);
      g.setAttribute('color', new THREE.BufferAttribute(c, 3));
      g.rotateY(i * Math.PI * 2 / n);
      const pala = new THREE.Mesh(g, V.mat), borde = new THREE.Mesh(g, V.matBorde);
      borde.renderOrder = 1; pala.renderOrder = 2;
      eje.add(borde); eje.add(pala);
    }
    V.rotores.add(eje);
  }
  V.grupo.add(V.rotores);
}

/** La envergadura del avion que vuela (m): la camara de atras se aleja segun el tamaño (un Hercules no se
 *  sigue a la distancia de un A-4). */
export const envergadura = () => (V.cuerpo && V.cuerpo.geometry.userData.envergadura) || 8.4;

/** OTRA MALLA con el mismo dibujo que el avion (el objetivo: systems/islas/objetivo3d.js): un grupo nuevo con
 *  su cuerpo y su contorno, o null mientras la malla no llego o el avion todavia no armo los materiales. */
export function grupoDe(clave) {
  const g = malla(clave);
  if (!g || !V.mat) return null;
  const grupo = new THREE.Group(), c = new THREE.Mesh(g, V.mat), b = new THREE.Mesh(g, V.matBorde);
  b.renderOrder = 1; c.renderOrder = 2; grupo.add(b); grupo.add(c);
  return grupo;
}

export function ver(on) { if (V.grupo) V.grupo.visible = on; }