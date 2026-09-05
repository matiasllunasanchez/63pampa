// EL TERRENO 3D DE LA BAHIA (PLAN_MEJORAS_3D P4/T3D-1).
//
// La leccion de GliderVR (docs/proyecto/ANALISIS_REFERENTES_3D §3): un terreno que se ve enorme
// y no cuesta nada son TRES cosas — un heightmap, UNA textura y niebla. Ni LOD, ni streaming, ni
// mapas satelitales. Y lo que NO hay que copiarle (§6): la ortofoto. La turba de Malvinas del
// juego es una PALETA (`LAND`), no una foto; el terreno se pinta con esos seis tonos o la bahia
// del climax seria de otro juego que el pasillo.
//
// QUE ES: una bahia generica —anillo de lomas, agua en el medio, playa de turba— centrada en el
// origen del mundo del arena, o sea alrededor del ring de combate (700 m de radio). El agua del
// centro NO se dibuja: el plano del mar ya esta ahi y tapa todo lo que quede bajo cero, y de ese
// corte sale la costa gratis.
//
// TODO ES DETERMINISTA: la altura sale de una funcion de (x,z) con semilla fija, no de ruido
// sorteado. La bahia es LA MISMA cada vez que se carga la mision — es un lugar, no un paisaje
// aleatorio (y ademas es la trampa §1 del spec: nada de Math.random para patrones visuales).
import { TERRENO3D, TERRENO3D_R, TERRENO3D_SEG, TERRENO3D_COSTA, TERRENO3D_ALTO } from '../data/tuning.js';

let on = TERRENO3D;

// hash entero → [0,1). Feo a proposito: es un generador, no una distribucion.
function h2(ix, iz) {
  let n = (ix * 374761393 + iz * 668265263 + 1442695040) | 0;
  n = (n ^ (n >> 13)) | 0;
  n = Math.imul(n, 1274126177) | 0;
  return ((n ^ (n >> 16)) >>> 0) / 4294967296;
}
// ruido de valor con interpolacion suave (smoothstep), una octava
function ruido(x, z, esc) {
  const px = x / esc, pz = z / esc;
  const ix = Math.floor(px), iz = Math.floor(pz);
  const fx = px - ix, fz = pz - iz;
  const sx = fx * fx * (3 - 2 * fx), sz = fz * fz * (3 - 2 * fz);
  const a = h2(ix, iz), b = h2(ix + 1, iz), c = h2(ix, iz + 1), d = h2(ix + 1, iz + 1);
  return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sz;
}

/** La altura del terreno en un punto, EN METROS. Negativa = fondo de bahia (lo tapa el mar).
 *  Es la unica fuente de verdad de la forma: si algun dia el terreno tiene que tapar el radar
 *  (T3D-2, gateada), la consulta sale de aca y no de una segunda cuenta paralela. */
export function alturaEn(x, z) {
  const r = Math.hypot(x, z);
  // PERFIL RADIAL: el centro es agua, la costa sube y afuera son lomas. `TERRENO3D_COSTA` es
  // donde esta la orilla; adentro el fondo baja, afuera la tierra trepa.
  const t = (r - TERRENO3D_COSTA) / TERRENO3D_R;
  const subida = t < 0 ? -28 * Math.min(1, -t * 3) : TERRENO3D_ALTO * Math.min(1, t * 1.35);
  // LOMAS: dos octavas, la grande da los cerros y la chica los rasga. Se apagan hacia el agua
  // para que la playa sea playa y no un acantilado sorteado.
  const tierra = Math.max(0, Math.min(1, t * 2.2));
  const lomas = (ruido(x, z, 620) - 0.5) * 2 * 150 + (ruido(x + 800, z - 400, 210) - 0.5) * 2 * 46;
  return subida + lomas * tierra;
}

/** La textura: grano de turba en los tonos de LAND. Una sola imagen, repetida — la receta
 *  entera de GliderVR. Se genera al construir y se re-genera si cambia el clima. */
function pintar(x, w, h, L) {
  x.fillStyle = L.mid; x.fillRect(0, 0, w, h);
  const tonos = [L.far, L.near, L.tuft, L.rock, L.furrow];
  // manchones deterministas: el surco y el pasto de la turba, sin un solo random
  for (let i = 0; i < 900; i++) {
    const a = h2(i, 7), b = h2(i, 13), c = h2(i, 29);
    x.fillStyle = tonos[(i * 3 + ((c * 5) | 0)) % tonos.length];
    x.fillRect((a * w) | 0, (b * h) | 0, 1 + ((c * 3) | 0), 1 + ((a * 2) | 0));
  }
}

/** Construye la bahia. `tex` es el helper de canvas del arena. */
export function crear(THREE, sc, tex, L) {
  if (!THREE || !sc) return null;
  const N = TERRENO3D_SEG, S = TERRENO3D_R * 2;
  const g = new THREE.PlaneGeometry(S, S, N, N);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  // COLOR POR VERTICE ademas de la textura: la banda de altura (playa → pasto → roca) es lo que
  // hace que las lomas se lean como lomas en 480x270. Con la textura sola el cerro es una mancha.
  const col = new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3);
  const c = new THREE.Color();
  const banda = [L.near, L.mid, L.tuft, L.rock, L.far];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = alturaEn(x, z);
    pos.setY(i, y);
    const k = Math.max(0, Math.min(banda.length - 1, Math.round(y / 90)));
    c.set(banda[k]);
    col.setXYZ(i, c.r, c.g, c.b);
  }
  g.setAttribute('color', col);
  g.computeVertexNormals();
  const t = tex(64, 64, (x, w, h) => pintar(x, w, h, L));
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(S / 120, S / 120);
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: t, vertexColors: true }));
  m.position.y = 0;
  m.visible = on;
  sc.add(m);
  return m;
}

/** Repinta la banda de color cuando cambia la turba del clima (LAND va en auto con el cielo). */
export function palette(m, L) {
  if (!m || !L) return;
  const g = m.geometry, pos = g.attributes.position, col = g.attributes.color;
  const c = { r: 0, g: 0, b: 0 };
  const banda = [L.near, L.mid, L.tuft, L.rock, L.far];
  const hex = banda.map(h => {
    const v = parseInt(h.slice(1), 16);
    // sRGB → lineal: three trabaja en lineal y sin esto la turba sale LAVADA (el mismo tropiezo
    // que ya tuvo el buque, ver ship3d.js)
    const f = u => { const s = u / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
    return [f((v >> 16) & 255), f((v >> 8) & 255), f(v & 255)];
  });
  for (let i = 0; i < pos.count; i++) {
    const k = Math.max(0, Math.min(banda.length - 1, Math.round(pos.getY(i) / 90)));
    c.r = hex[k][0]; c.g = hex[k][1]; c.b = hex[k][2];
    col.setXYZ(i, c.r, c.g, c.b);
  }
  col.needsUpdate = true;
}

export function frame(m) { if (m) m.visible = on; }

// ---- SONDA de desarrollo (P4/T3D-1) — QUITAR cuando la bahia entre por mision ----
if (typeof window !== 'undefined') window.__tierra3d = (v) => {
  if (v !== undefined) on = !!(+v);
  return JSON.stringify({ on, r: TERRENO3D_R, costa: TERRENO3D_COSTA, alto: TERRENO3D_ALTO,
    seg: TERRENO3D_SEG, altoEn1500: Math.round(alturaEn(1500, 0)) });
};
