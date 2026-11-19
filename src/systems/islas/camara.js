// LAS ISLAS REALES — LAS TRES VISTAS (prototipo I0; autor, 19/11: "la vision de cambio de camara, primera
// persona, tercera y desde arriba me encanta, traigamos eso tambien").
//
// Copia de Dusk Patrol (game/camera.js): tres poses —DESDE ARRIBA (norte arriba), DE ATRAS y CABINA— y al
// cambiar de vista la camara viaja de una a otra en ~1 s: interpola la posicion y el campo, y la
// orientacion por slerp. La de atras persigue al avion con retardo (rumbo, cabeceo y alabeo suavizados).
//
// Los numeros de Dusk Patrol son para su caza (~19 m); los de la cabina se achicaron al A-4 (~12 m).
const THREE = window.THREE || null;

export const ARRIBA = 0, ATRAS = 1, CABINA = 2;
const DEG = Math.PI / 180;
const CABECEO_ATRAS = 0.4;    // cuanto del cabeceo del avion acompaña la camara de atras
const C = { vista: ATRAS, previa: ATRAS, mezcla: 1, sig: { yaw: 0, pitch: 0, roll: 0 }, iniciada: false, zoom: 1, alto: 0 };
// LOS TRES ZOOM DE LA VISTA DE ARRIBA (19/11, el autor: "un poco mas cerca… que la vista desde arriba tenga 3
// niveles de zoom; el que esta ahora es el mas lejos"): metros de la camara sobre el avion. Arranca en el del medio.
export const ZOOMS = [95, 145, 215];
/** Acerca (-1) o aleja (+1) la vista de arriba. Devuelve el nivel (0 = el mas cerca). */
export function zoom(dir) { C.zoom = Math.max(0, Math.min(ZOOMS.length - 1, C.zoom + dir)); return C.zoom; }
export const nivelZoom = () => C.zoom;

export const vista = () => C.vista;
/** Cuanto pesa la cabina en el cuadro (0..1): el panel entra y sale deslizandose con esto. */
export function pesoCabina() {
  const s = C.mezcla * C.mezcla * (3 - 2 * C.mezcla);
  return (C.previa === CABINA ? 1 : 0) * (1 - s) + (C.vista === CABINA ? 1 : 0) * s;
}
export const mezclaLista = () => C.mezcla >= 0.99;
/** Ciclo de Dusk Patrol: arriba → atras → cabina → arriba. */
export function siguiente() { C.previa = C.vista; C.vista = (C.vista + 1) % 3; C.mezcla = 0; return C.vista; }
export function reiniciar() { C.iniciada = false; }
/** Pone una vista de una (sin viaje): la sonda __malvinas({ vista }). */
export function poner(v) { C.vista = C.previa = v; C.mezcla = 1; }

const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dir = (yaw, pitch) => [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
/** Base {r, u, f} a partir del adelante y un alabeo (positivo = baja el ala derecha). */
function base(f, roll) {
  let r = norm(cruz(f, [0, 1, 0]));
  if (!isFinite(r[0])) r = [1, 0, 0];
  const u0 = cruz(r, f), c = Math.cos(roll), s = Math.sin(roll);
  return { r: [r[0] * c - u0[0] * s, r[1] * c - u0[1] * s, r[2] * c - u0[2] * s], u: [u0[0] * c + r[0] * s, u0[1] * c + r[1] * s, u0[2] * c + r[2] * s], f };
}

function pose(v, A, sueloH) {
  const p = [A.pos.x, A.pos.y, A.pos.z];
  if (v === ARRIBA) {
    // EL RUMBO ARRIBA (19/11, el autor: "que la mira este en frente y el avion dispare derecho"): antes era norte
    // arriba (Dusk Patrol) y el avion apuntaba a cualquier lado de la pantalla; ahora la pantalla gira con el
    // rumbo: el avion siempre apunta para arriba, la mira queda adelante y los tiros suben derecho. La camara va
    // un poco adelantada (el avion abajo del centro, arriba del tablero: se ve lo que viene). La brujula del tablero dice el norte.
    const h = C.alto || ZOOMS[C.zoom], lead = h * 0.12, sy = Math.sin(A.yaw), cy = Math.cos(A.yaw);
    return { p: [p[0] + sy * lead, p[1] + h, p[2] - cy * lead], r: [cy, 0, sy], u: [sy, 0, -cy], f: [0, -1, 0], fov: 58 };
  }
  if (v === ATRAS) {
    // (Dusk Patrol acompaña el 85 % del cabeceo; con el gas del pasillo —bombear trepa fuerte— la camara
    // terminaba mirando el cielo. Acompaña menos: el avion sube en el cuadro y el horizonte queda)
    const cf = dir(C.sig.yaw, C.sig.pitch * CABECEO_ATRAS);
    // EL TURBO ALEJA LA CAMARA (el `turboDz` del pasillo: el avion se va para adelante) y abre el campo
    // …y LA DISTANCIA VA CON EL TAMAÑO: la de Dusk Patrol (46 m) es para un caza; un Hercules de 40 m de
    // envergadura se sigue mas de lejos (y un helicoptero chico, igual que un caza)
    const k = Math.max(1, (A.envergadura || 8.4) / 12);
    const d = (46 + (A.turbo || 0) * 14) * k;
    const q = [p[0] - cf[0] * d, p[1] - cf[1] * d + 10 * k, p[2] - cf[2] * d];
    q[1] = Math.max(q[1], Math.max(sueloH(q[0], q[2]), 0) + 6);
    const look = norm([p[0] + cf[0] * 30 - q[0], p[1] + cf[1] * 30 - q[1], p[2] + cf[2] * 30 - q[2]]);
    const B = base(look, C.sig.roll * 0.3);
    return { p: q, r: B.r, u: B.u, f: B.f, fov: 62 + (A.turbo || 0) * 8 };
  }
  // CABINA: en el asiento, mirando 6° por debajo del morro (como Dusk Patrol)
  const B = base([A.fwd.x, A.fwd.y, A.fwd.z], A.roll || 0), c = Math.cos(6 * DEG), s = Math.sin(6 * DEG);
  const f = norm([B.f[0] * c - B.u[0] * s, B.f[1] * c - B.u[1] * s, B.f[2] * c - B.u[2] * s]);
  const u = norm([B.u[0] * c + B.f[0] * s, B.u[1] * c + B.f[1] * s, B.u[2] * c + B.f[2] * s]);
  const at = [0, 1.0, 2.6];                     // asiento del A-4: 1 m arriba y 2,6 m adelante del centro
  const q = [p[0] + B.r[0] * at[0] + B.u[0] * at[1] + B.f[0] * at[2], p[1] + B.r[1] * at[0] + B.u[1] * at[1] + B.f[1] * at[2], p[2] + B.r[2] * at[0] + B.u[2] * at[1] + B.f[2] * at[2]];
  return { p: q, r: B.r, u, f, fov: 70 };
}

const _m = THREE ? new THREE.Matrix4() : null, _qa = THREE ? new THREE.Quaternion() : null, _qb = THREE ? new THREE.Quaternion() : null;
function quat(P, out) {
  _m.makeBasis(new THREE.Vector3(...P.r), new THREE.Vector3(...P.u), new THREE.Vector3(-P.f[0], -P.f[1], -P.f[2]));
  return out.setFromRotationMatrix(_m);
}
const envolver = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

/** Un cuadro: suaviza la persecucion, avanza la mezcla y pone la camara de three. */
export function frame(cam, A, dt, sueloH) {
  cam.userData.pp = null;   // (la camara del pasillo pone su punto principal; esta, la simetrica de siempre)
  if (!C.iniciada) { C.sig = { yaw: A.yaw, pitch: A.pitch, roll: A.roll || 0 }; C.iniciada = true; }
  C.sig.yaw += envolver(A.yaw - C.sig.yaw) * Math.min(1, dt * 3.2);
  C.sig.pitch += (A.pitch - C.sig.pitch) * Math.min(1, dt * 3.2);
  C.sig.roll += ((A.roll || 0) - C.sig.roll) * Math.min(1, dt * 2.5);
  C.mezcla = Math.min(1, C.mezcla + dt / 1.0);
  // el zoom VIAJA (medio segundo), no salta
  C.alto = C.alto ? C.alto + (ZOOMS[C.zoom] - C.alto) * Math.min(1, dt * 5) : ZOOMS[C.zoom];
  const s = C.mezcla * C.mezcla * (3 - 2 * C.mezcla);
  const B = pose(C.vista, A, sueloH);
  let P = B, q;
  if (s < 1 && C.previa !== C.vista) {
    const Ap = pose(C.previa, A, sueloH);
    q = quat(Ap, _qa).slerp(quat(B, _qb), s);
    P = { p: [0, 1, 2].map(i => Ap.p[i] + (B.p[i] - Ap.p[i]) * s), fov: Ap.fov + (B.fov - Ap.fov) * s };
  } else q = quat(B, _qa);
  cam.position.set(P.p[0], P.p[1], P.p[2]);
  cam.quaternion.copy(q);
  cam.fov = P.fov; cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
}

// =====================================================================================================
// LA CAMARA DEL PASILLO (autor, 19/11: "TODO debe parecerse MUCHISIMO a pasillo"; "los efectos cuando choca
// con el agua deben ser LOS mismos que pasillo"). La vista de atras y la cabina NO son las de Dusk Patrol:
// son exactamente `proj()` de core/fx.js —focal F = 135 px, horizonte en la fila HOR = 96, la camara mira
// horizontal y el avion vuela PZ adelante (14 m; 1,6 en cabina) con el ojo a la altura `cam.y`—, asi el
// sprite del pasillo, sus particulas, el rocio, la estela, el choque contra el agua y el resto de lo que el
// pasillo dibuja en pantalla caen EXACTO sobre el mundo 3D. El giro del mundo (alabeo, piruetas, el rolido
// Q/E) y el corrimiento del cabeceo de cabina NO los hace esta camara: los hace game.js rotando el canvas,
// como con todo el pasillo; por eso el render tiene margen (RENDER_*) para que el giro no deje esquinas.
// =====================================================================================================
export const FOCAL = 135, HOR_FILA = 96;              // render/ctx.js (F, HOR)
// el lienzo con margen: el mismo del mar 3D del pasillo (legacy/three-world.js M3W/M3H, blit en -108/-153)
export const RENDER_W = 696, RENDER_H = 576, RENDER_X = -108, RENDER_Y = -153;
// el punto principal (W/2, HOR) en pixeles del lienzo con margen
const PPX = 240 - RENDER_X, PPY_ARRIBA = HOR_FILA - RENDER_Y;

/** Proyeccion de la camara del pasillo sobre el lienzo con margen (frustum asimetrico). */
export function proyeccionPasillo(cam3) {
  const n = cam3.near, f = cam3.far;
  cam3.projectionMatrix.makePerspective(-PPX / FOCAL * n, (RENDER_W - PPX) / FOCAL * n,
    PPY_ARRIBA / FOCAL * n, -(RENDER_H - PPY_ARRIBA) / FOCAL * n, n, f);
  cam3.projectionMatrixInverse.copy(cam3.projectionMatrix).invert();
  // lo que necesita el terreno (marcha el rayo por pixel): el punto principal desde ABAJO y la focal
  cam3.userData.pp = [PPX, RENDER_H - PPY_ARRIBA]; cam3.userData.foc = FOCAL;
}

/** Pone la camara de three donde esta la del pasillo. `pas` = core/state `cam` ({x, y}: de costado y altura
 *  sobre el suelo), `pz` = a cuantos metros adelante va el avion, `m` = el marco del avion en el mapa
 *  (islas.js `marco`). */
export function framePasillo(cam3, pas, pz, m) {
  const sy = Math.sin(m.yaw), cy = Math.cos(m.yaw);
  cam3.position.set(m.x - sy * pz + cy * pas.x, m.g + pas.y, m.z + cy * pz + sy * pas.x);
  cam3.rotation.set(0, -m.yaw, 0, 'YXZ');
  cam3.updateMatrixWorld();
  proyeccionPasillo(cam3);
}
