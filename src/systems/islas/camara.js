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
const C = { vista: CABINA, previa: CABINA, mezcla: 1, sig: { yaw: 0, pitch: 0, roll: 0 }, iniciada: false };

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
    const lead = 30;
    return { p: [p[0] + Math.sin(A.yaw) * lead, p[1] + 215, p[2] - Math.cos(A.yaw) * lead], r: [1, 0, 0], u: [0, 0, -1], f: [0, -1, 0], fov: 58 };
  }
  if (v === ATRAS) {
    const cf = dir(C.sig.yaw, C.sig.pitch * 0.85);
    const q = [p[0] - cf[0] * 46, p[1] - cf[1] * 46 + 10, p[2] - cf[2] * 46];
    q[1] = Math.max(q[1], Math.max(sueloH(q[0], q[2]), 0) + 6);
    const look = norm([p[0] + cf[0] * 30 - q[0], p[1] + cf[1] * 30 - q[1], p[2] + cf[2] * 30 - q[2]]);
    const B = base(look, C.sig.roll * 0.3);
    return { p: q, r: B.r, u: B.u, f: B.f, fov: 62 };
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
  if (!C.iniciada) { C.sig = { yaw: A.yaw, pitch: A.pitch, roll: A.roll || 0 }; C.iniciada = true; }
  C.sig.yaw += envolver(A.yaw - C.sig.yaw) * Math.min(1, dt * 3.2);
  C.sig.pitch += (A.pitch - C.sig.pitch) * Math.min(1, dt * 3.2);
  C.sig.roll += ((A.roll || 0) - C.sig.roll) * Math.min(1, dt * 2.5);
  C.mezcla = Math.min(1, C.mezcla + dt / 1.0);
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
  if (Math.abs(cam.fov - P.fov) > 0.01) { cam.fov = P.fov; cam.updateProjectionMatrix(); }
  cam.updateMatrixWorld();
}
