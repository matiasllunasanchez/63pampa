// LAS ISLAS REALES — EL AVION EN 3D (prototipo I0, docs/proyecto/ANALISIS_ISLAS_REALES.md).
//
// Pedido del autor (19/11): "usar la misma logica que se uso para armar el avioncito de Dusk Patrol, pero
// con los nuestros desde Blender". Es eso:
//   · LA MALLA es la nuestra: el A-4 de tools/blender/modelos.py, bajado a ~1500 triangulos y con la
//     pintura horneada a un color por cara (tools/blender/exportar_malla.py → src/data/mallas/<clave>.json);
//   · EL DIBUJO es el de Dusk Patrol (render/shaders/mesh.js): luz de cielo cubierto en TRES tonos, la
//     niebla del terreno, el contorno oscuro de un pixel y la misma paleta con dither del terreno.
// El contorno es un casco invertido inflado UN PIXEL en pantalla (Dusk Patrol lo hace en su pasada final;
// aca no hay pasada final, y el casco da el mismo borde sin ella).
import MALLA_SKY from '../../data/mallas/sky.json';
import { PALETA_GLSL, paletaUniform } from './terreno3d.js';

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

const MALLAS = { sky: MALLA_SKY };
const V = { grupo: null, matBorde: null, mat: null };

function geometria(m) {
  const n = m.tris, pos = new Float32Array(m.pos), col = new Float32Array(n * 9);
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) col.set(m.col.slice(i * 3, i * 3 + 3), i * 9 + k * 3);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();                    // sin indices: cada triangulo tiene su normal (caras planas)
  return g;
}

/** Arma el avion la primera vez. `clave` = la del modelo de Blender (hoy solo 'sky', el A-4B). */
export function crear(escena, sol, clave = 'sky') {
  if (V.grupo) return V.grupo;
  if (!THREE) return null;
  const g = geometria(MALLAS[clave] || MALLA_SKY);
  V.mat = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: VS, fragmentShader: FS, fog: false,
    uniforms: { uSun: { value: new THREE.Vector3(...sol) }, uHaze: { value: new THREE.Vector3(0.60, 0.63, 0.67) }, uPal: paletaUniform() },
  });
  V.matBorde = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: VS_BORDE, fragmentShader: FS_BORDE, side: THREE.BackSide, fog: false,
    uniforms: { uRes: { value: new THREE.Vector2(480, 270) } },
  });
  const cuerpo = new THREE.Mesh(g, V.mat), borde = new THREE.Mesh(g, V.matBorde);
  borde.renderOrder = 1; cuerpo.renderOrder = 2;
  const grupo = new THREE.Group();
  grupo.add(borde); grupo.add(cuerpo);
  grupo.rotation.order = 'YXZ';
  escena.add(grupo);
  V.grupo = grupo;
  return grupo;
}

/** Pone el avion donde esta A (yaw 0 = norte, horario; la malla mira a −z). */
export function frame(A, visible, res) {
  if (!V.grupo) return;
  V.grupo.visible = visible;
  if (!visible) return;
  V.grupo.position.set(A.pos.x, A.pos.y, A.pos.z);
  V.grupo.rotation.set(A.pitch, -A.yaw, -(A.roll || 0));
  if (res) V.matBorde.uniforms.uRes.value.set(res.x, res.y);
}

export function ver(on) { if (V.grupo) V.grupo.visible = on; }
