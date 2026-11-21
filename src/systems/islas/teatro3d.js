// LAS ISLAS REALES — EL TEATRO EN 3D (prototipo I1, docs/proyecto/PLAN_TEATRO_MALVINAS.md): dibuja lo que arma
// systems/islas/teatro.js —las piezas de las bases, los buques, las PAC y los soldados— con las mallas de Blender
// (assets/mallas, `exportar_malla.py --modulo`), con el mismo dibujo que el avion (avion3d.js `grupoDe`).
//
// LAS MALLAS SALEN EN SUS UNIDADES (`--k 1`) y aca se llevan a METROS por su medida real (MEDIDA: el largo mayor
// en planta; el soldado, por su alto). Algunas van EXAGERADAS a proposito, como en el pasillo: un soldado de 1,8 m
// visto desde 145 m es medio pixel.
//
// De lejos se apagan (LEJOS): los soldados primero; los buques, lo ultimo.
import { grupoDe } from './avion3d.js';
import { pose } from './soldados.js';

const MEDIDA = { harrier: 14.5, t21: 117, t42: 125, log: 126, nido_rapier: 12, manpad: 6, camion_aa: 9, radar: 9, carpa: 8,
  deposito: 14, puesto: 8, pucara: 14.25, herc: 29.8 };
const ALTO = { soldado_corre: 3.4 };   // (×1,9: exagerado para que se lea)
// LO DE TIERRA, EXAGERADO (como el pasillo): a la medida real una carpa desde la vista de arriba era un punto
const EXAGERA = { nido_rapier: 2, manpad: 2.2, camion_aa: 2, radar: 2, carpa: 2, deposito: 1.8, puesto: 2, harrier: 1.3 };
const LEJOS = { soldado: 2500, pieza: 9000, buque: 16000, avion: 14000 };
const K = {};
let escena = null;

function escala(clave, g) {
  if (K[clave]) return K[clave];
  const geo = g.children[0].geometry;
  geo.computeBoundingBox();
  const b = geo.boundingBox, sx = b.max.x - b.min.x, sy = b.max.y - b.min.y, sz = b.max.z - b.min.z;
  K[clave] = ALTO[clave] ? ALTO[clave] / sy : (MEDIDA[clave] || 10) * (EXAGERA[clave] || 1) / Math.max(sx, sz);
  return K[clave];
}
// LOS SOLDADOS: todas sus poses a la MISMA escala (la del alto de la carrera, ALTO_SOLDADO): el cuerpo a tierra es bajo
// y por su alto saldria gigante
const ALTO_SOLDADO = 4.6, ALTO_MALLA = 2.08;   // (×2,2: mas que la ronda vieja — corriendo, a 100 m, se tienen que leer)
function grupoSoldado(clave) {
  const g = grupoDe(clave);
  if (!g) return null;
  g.scale.setScalar(ALTO_SOLDADO / ALTO_MALLA); g.rotation.order = 'YXZ'; g.visible = false;
  escena.add(g);
  return g;
}
/** El grupo de `o` (lo crea cuando su malla llego). */
function grupo(o, clave) {
  if (o.__g && o.__gk === clave) return o.__g;
  const g = grupoDe(clave);
  if (!g) return null;
  if (o.__g) escena.remove(o.__g);
  g.scale.setScalar(escala(clave, g));
  g.rotation.order = 'YXZ';
  escena.add(g);
  o.__g = g; o.__gk = clave;
  return g;
}
const lejos = (g, cam, x, y, z, max) => {
  const d = Math.hypot(x - cam.position.x, z - cam.position.z);
  g.visible = d < max;
  return g.visible;
};

/** Un cuadro. `E` = teatro.js `escena()`; `cazas` = los Harriers del duelo en el mapa (solo desde arriba: en las
 *  vistas del pasillo los dibuja el pasillo); `cam` = la camara de three. */
export function frame(sc, E, cazas, cam, cha) {
  escena = sc;
  if (!E) return;
  for (const e of E.piezas) {
    const g = grupo(e, e.malla);
    if (!g || !lejos(g, cam, e.x, e.g, e.z, LEJOS.pieza)) continue;
    g.position.set(e.x, e.g, e.z); g.rotation.set(0, -e.rot, 0);
    // la pieza rota queda aplastada y ladeada
    const k = escala(e.malla, g);
    g.scale.set(k, e.vivo ? k : k * 0.3, k);
    if (!e.vivo) g.rotation.z = 0.25;
  }
  for (const b of E.buques) {
    const g = grupo(b, b.malla);
    if (!g || !lejos(g, cam, b.x, 0, b.z, LEJOS.buque)) continue;
    // el que se hunde: escora y baja
    g.position.set(b.x, b.vivo ? 0 : -6, b.z); g.rotation.set(0, -b.rot, b.vivo ? 0 : 0.35);
  }
  // LOS SOLDADOS (systems/islas/soldados.js): uno por uno, con la malla de su pose (la carrera en tres cuadros, con
  // caja, o cuerpo a tierra); cada pose es un grupo propio que se prende y se apaga (cambiar mallas cada cuadro es basura)
  for (const s of E.soldados) {
    const clave = pose(s);
    s.__p = s.__p || {};
    const g = s.__p[clave] || (s.__p[clave] = grupoSoldado(clave));
    if (s.__vis && s.__vis !== g) s.__vis.visible = false;
    if (!g) { s.__vis = null; continue; }
    s.__vis = g;
    if (!lejos(g, cam, s.x, s.g, s.z, LEJOS.soldado)) continue;
    // (la malla mira a −x: rotar `π − yaw` la pone mirando a donde va; el caido, un poco torcido)
    g.position.set(s.x, s.g, s.z); g.rotation.set(0, Math.PI - s.yaw + (s.vivo ? 0 : 0.6), 0);
  }
  for (const c of E.pac) {
    c.__gs = c.__gs || [{}, {}];
    for (let i = 0; i < 2; i++) {
      const g = grupo(c.__gs[i], 'harrier');
      if (!g) continue;
      const a = c.aviones[i];
      if ((c.estado !== 'orbita' && c.estado !== 'vector') || !a) { g.visible = false; continue; }
      if (!lejos(g, cam, a.x, a.y, a.z, LEJOS.avion)) continue;
      // en el viraje van ladeados hacia adentro
      g.position.set(a.x, a.y, a.z); g.rotation.set(0, -a.yaw, c.estado === 'vector' || c.forma === 'ocho' ? 0 : -0.45);
    }
  }
  frame.cazas = frame.cazas || [];
  for (let i = 0; i < Math.max(cazas.length, frame.cazas.length); i++) {
    const o = frame.cazas[i] || (frame.cazas[i] = {});
    const g = grupo(o, 'harrier');
    if (!g) continue;
    const h = cazas[i];
    g.visible = !!h;
    if (h) { g.position.set(h.x, h.y, h.z); g.rotation.set(h.pitch || 0, -h.yaw, -(h.roll || 0)); lejos(g, cam, h.x, h.y, h.z, LEJOS.avion); }
  }
  // LA CHANCHA (solo desde arriba: en las vistas del pasillo la dibuja el pasillo)
  const gc = grupo(frame.cha || (frame.cha = {}), 'herc');
  if (gc) { gc.visible = !!cha; if (cha) { gc.position.set(cha.x, cha.y, cha.z); gc.rotation.set(0, -cha.yaw, 0); } }
}

/** Fuera de las islas: todo apagado. */
export function apagar(E) {
  if (!E) return;
  for (const o of [...E.piezas, ...E.buques]) if (o.__g) o.__g.visible = false;
  for (const s of E.soldados) for (const g of Object.values(s.__p || {})) if (g) g.visible = false;
  for (const c of E.pac) for (const o of c.__gs || []) if (o.__g) o.__g.visible = false;
  for (const o of frame.cazas || []) if (o.__g) o.__g.visible = false;
  if (frame.cha && frame.cha.__g) frame.cha.__g.visible = false;
}
