// LAS ISLAS — LOS SOLDADOS CON VIDA (21/11, el autor: "pone algunos corriendo y haciendo cosas, darle un poco mas
// de vida"). Antes eran grupos que daban vueltas en ronda. Ahora cada soldado es uno, con una TAREA en su base:
//   ronda     camina en circulo alrededor de su punto (la de siempre, al paso)
//   trota     corre de un punto de la base a otro, para un rato y sigue
//   carga     va del deposito al camion (o a una carpa) con una CAJA en brazos y vuelve sin ella
//   guardia   quieto al lado de un puesto; cada tanto mira para otro lado o da unos pasos
// Y REACCIONAN AL AVION: si pasas bajo y cerca de su base, o cae una bomba o una rafaga cerca, CORREN a cubrirse
// (de costado a tu pasada) y se tiran CUERPO A TIERRA unos segundos; despues vuelven a lo suyo.
// Las mallas (assets/mallas/isl_*.js, tools/blender/modelos_soldados.py): tres cuadros de la carrera, con y sin caja,
// y el cuerpo a tierra, britanico y argentino. Las dibuja teatro3d.js con `pose()`.
import * as mundo from './mundo.js';

const VEL = { ronda: 1.5, trota: 4.5, carga: 2.2, vuelve: 3.2, huye: 5.8, guardia: 1.2 };
const ALARMA = { R: 900, ALTO: 350, BOMBA: 380, BALA: 120 };   // m: cerca, bajo, y el radio del susto
const TIERRA_T = [3.5, 7];                                    // s tirado cuerpo a tierra
const CALMA_T = 5;                                             // s despues de levantarse sin volver a asustarse
const ZANCADA = 1.7;                                           // m por ciclo de la carrera (los 3 cuadros)

/** Los soldados de un grupo `n` del dato (data/islas_teatro.js `soldados`). `piezas` = las de la base ya armadas;
 *  `tierra(x, z, rad)` busca suelo plano cerca (teatro.js `tierraCerca`). */
export function crear(lista, { base, x, z, r, bando, piezas, rnd, tierra }) {
  const p0 = tierra(x, z, 6, 500);
  if (!p0) return;
  const de = t => piezas.filter(e => e.base === base && t.includes(e.tipo));
  const dep = de(['deposito']), dest = de(['camion', 'carpa']), puestos = de(['puesto', 'radar', 'canon']);
  const tareas = ['ronda', 'trota', 'trota'];
  if (dep.length && dest.length) tareas.push('carga', 'carga');
  if (puestos.length) tareas.push('guardia');
  const tarea = tareas[(rnd() * tareas.length) | 0];
  const n = tarea === 'guardia' ? 1 + ((rnd() * 2) | 0) : 2 + ((rnd() * 3) | 0);
  // los puntos de la base a donde trota (tierra firme, sacados una vez)
  const puntos = [];
  if (tarea === 'trota') for (let i = 0; i < 4; i++) {
    const a = rnd() * 6.283, d = r * (0.3 + 0.7 * rnd()), q = tierra(x + Math.cos(a) * d, z + Math.sin(a) * d, 3, 200);
    if (q) puntos.push([q[0], q[1]]);
  }
  const ronda = { x: p0[0], z: p0[1], r: 8 + rnd() * 10, v: VEL.ronda * (0.8 + rnd() * 0.4), fase: rnd() * 6.283 };
  let A = null, B = null;
  if (tarea === 'carga') {
    const d = dep[(rnd() * dep.length) | 0], c = dest[(rnd() * dest.length) | 0];
    A = [d.x + (c.x - d.x) * 0.15, d.z + (c.z - d.z) * 0.15]; B = [c.x + (d.x - c.x) * 0.12, c.z + (d.z - c.z) * 0.12];
  }
  const P = tarea === 'guardia' ? puestos[(rnd() * puestos.length) | 0] : null;
  for (let i = 0; i < n; i++) {
    const s = { x: p0[0] + (rnd() - 0.5) * 6, z: p0[1] + (rnd() - 0.5) * 6, g: p0[2], yaw: rnd() * 6.283, bando, base, vivo: true,
      tarea, est: 'anda', v: 0, t: rnd() * 2, anim: rnd() * 3, caja: false, obj: null, calma: 0, susto: -1,
      ronda, i, puntos, A, B, ida: rnd() < 0.5 };
    ronda.n = n;
    if (P) { s.x = P.x + Math.cos(i * 2.4 + rnd()) * (P.r + 4); s.z = P.z + Math.sin(i * 2.4 + rnd()) * (P.r + 4); s.casa = [s.x, s.z]; }
    if (tarea === 'carga') { const q = s.ida ? A : B; s.x = q[0] + (rnd() - 0.5) * 4; s.z = q[1] + (rnd() - 0.5) * 4; s.t = rnd() * 3; }
    s.g = Math.max(0, mundo.sueloH(s.x, s.z));
    lista.push(s);
  }
}

/** Va hacia (x, z) a `v` m/s; true al llegar. */
function ir(s, x, z, v, dt) {
  const dx = x - s.x, dz = z - s.z, d = Math.hypot(dx, dz);
  if (d < 0.6) { s.v = 0; return true; }
  const k = Math.min(1, v * dt / d);
  s.x += dx * k; s.z += dz * k; s.v = v;
  s.yaw = Math.atan2(dz, dx);
  return false;
}

/** EL SUSTO: corre de costado a la pasada del avion (`yaw`, su rumbo; o lejos de un punto) y se tira al suelo. */
function asustar(s, dx, dz, rnd) {
  if (!s.vivo || s.est === 'huye' || s.est === 'tierra' || s.calma > 0) return;
  const d = Math.hypot(dx, dz) || 1, lejos = 18 + rnd() * 30, desv = (rnd() - 0.5) * 1.2;
  const ux = dx / d, uz = dz / d, c = Math.cos(desv), sn = Math.sin(desv);
  s.est = 'huye'; s.caja = false; s.susto = rnd() * 0.6;
  s.obj = [s.x + (ux * c - uz * sn) * lejos, s.z + (ux * sn + uz * c) * lejos];
}

/** Un cuadro. `P` = el avion en el mapa ({ x, z, g, y, yaw }). */
export function paso(lista, dt, P, rnd) {
  const alto = P.g + P.y, fx = Math.sin(P.yaw), fz = -Math.cos(P.yaw);
  for (const s of lista) {
    if (!s.vivo) continue;
    s.calma = Math.max(0, s.calma - dt);
    // ---- EL AVION PASA BAJO Y CERCA: corren a cubrirse, de costado a la pasada ----
    const dx = s.x - P.x, dz = s.z - P.z, dist = Math.hypot(dx, dz);
    if (dist < ALARMA.R && alto - s.g < ALARMA.ALTO) {
      // de que lado de tu pasada estan: para ese lado se van
      const lado = Math.sign(dx * fz - dz * fx) || 1;
      asustar(s, fz * lado, -fx * lado, rnd);
    }
    switch (s.est) {
      case 'huye':
        if (s.susto > 0) { s.susto -= dt; s.v = 0; break; }
        if (ir(s, s.obj[0], s.obj[1], VEL.huye, dt)) { s.est = 'tierra'; s.t = TIERRA_T[0] + rnd() * (TIERRA_T[1] - TIERRA_T[0]); s.v = 0; }
        break;
      case 'tierra':
        s.v = 0;
        if ((s.t -= dt) <= 0) { s.est = 'anda'; s.calma = CALMA_T; s.t = 0.5 + rnd(); s.obj = null; }
        break;
      default: tarea(s, dt, rnd);
    }
    if (s.v > 0) {
      s.g = Math.max(0, mundo.sueloH(s.x, s.z));
      s.anim += dt * s.v / ZANCADA * 3;
    }
  }
}

function tarea(s, dt, rnd) {
  switch (s.tarea) {
    case 'ronda': {
      const R = s.ronda;
      R.fase += dt * R.v / R.r / R.n;              // (cada uno empuja su parte: la ronda es del grupo)
      const a = R.fase + s.i * 0.55;
      ir(s, R.x + Math.cos(a) * R.r, R.z + Math.sin(a) * R.r, R.v * 1.6, dt);
      if (s.v > R.v) s.v = R.v;
      break;
    }
    case 'trota': {
      if (s.t > 0) { s.t -= dt; s.v = 0; break; }
      if (!s.obj) { const q = s.puntos[(rnd() * s.puntos.length) | 0]; s.obj = q ? [q[0] + (rnd() - 0.5) * 8, q[1] + (rnd() - 0.5) * 8] : [s.x + (rnd() - 0.5) * 40, s.z + (rnd() - 0.5) * 40]; }
      if (ir(s, s.obj[0], s.obj[1], VEL.trota * (0.9 + 0.2 * ((s.i * 7) % 3) / 2), dt)) { s.obj = null; s.t = 1 + rnd() * 3; }
      break;
    }
    case 'carga': {
      // ida = del deposito (A) al camion (B) con la caja; vuelta, sin ella
      if (s.t > 0) { s.t -= dt; s.v = 0; break; }
      const q = s.ida ? s.B : s.A;
      s.caja = s.ida;
      if (ir(s, q[0], q[1], s.ida ? VEL.carga : VEL.vuelve, dt)) { s.ida = !s.ida; s.caja = s.ida; s.t = 1 + rnd() * 1.5; }
      break;
    }
    case 'guardia': {
      if (s.t > 0) { s.t -= dt; s.v = 0; break; }
      if (!s.obj) {
        if (rnd() < 0.6) { s.yaw += (rnd() - 0.5) * 2.4; s.t = 2 + rnd() * 4; break; }      // mira para otro lado
        s.obj = [s.casa[0] + (rnd() - 0.5) * 12, s.casa[1] + (rnd() - 0.5) * 12];          // unos pasos
      }
      if (ir(s, s.obj[0], s.obj[1], VEL.guardia, dt)) { s.obj = s.obj[0] === s.casa[0] ? null : s.casa.slice(); if (!s.obj) s.t = 2 + rnd() * 4; }
      break;
    }
  }
}

/** Una bomba en tierra: mata en `radio` y asusta a los de alrededor. */
export function bomba(lista, x, z, radio, rnd) {
  for (const s of lista) {
    if (!s.vivo) continue;
    const d = Math.hypot(s.x - x, s.z - z);
    if (d < radio) { s.vivo = false; continue; }
    if (d < ALARMA.BOMBA) { s.calma = 0; asustar(s, s.x - x, s.z - z, rnd); }
  }
}
/** Una bala del cañon que llega al suelo en (x, z) a la altura `y`: mata al que toca y asusta a los de cerca. */
export function bala(lista, x, z, y, rnd) {
  let pego = false;
  for (const s of lista) {
    if (!s.vivo || Math.abs(s.x - x) > 25 || Math.abs(s.z - z) > 25) continue;
    if (y < s.g + 4 && Math.abs(s.x - x) < 2.5 && Math.abs(s.z - z) < 2.5) { s.vivo = false; pego = true; continue; }
    if (Math.hypot(s.x - x, s.z - z) < ALARMA.BALA) { s.calma = 0; asustar(s, s.x - x, s.z - z, rnd); }
  }
  return pego;
}

/** Que malla lleva ahora (assets/mallas): cuerpo a tierra, o la carrera (con o sin caja) en su cuadro. */
export function pose(s) {
  const b = s.bando === 'arg' ? 'arg' : 'brit';
  if (!s.vivo || s.est === 'tierra') return 'isl_tierra_' + b;
  const f = s.v > 0 ? ['0', '2', '4'][Math.floor(s.anim) % 3] : '0';
  return (s.caja ? 'isl_carga_' : 'isl_corre_') + b + '_' + f;
}
