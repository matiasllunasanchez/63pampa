// LA ARTILLERIA DEL BUQUE en la aproximacion de LA SUELTA (docs/sistemas/PLAN_DEFENSAS_BUQUE.md F3).
// Los numeros en data/sistemas_buque.js (ARTILLERIA).
//
// Dos armas, las dos SALEN DE SUS SISTEMAS (core/blanco.js `sistemas`): si la pieza esta FUERA no
// tira, si esta DAÑADA tira peor. Eso es lo que convierte cañonearlas en una decision.
//   EL CAÑON DE 4,5"   salvas de columnas de agua que caminan sobre tu rumbo (castiga volar DERECHO)
//   20 MM / 40 MM      rafagas de trazadoras desde el montaje, con su dispersion
//   CUBIERTA           el granizo de ametralladoras y fusiles: presion, casi no pega, no se apaga
//
// MISMA REGLA DEL LIMITE que todos los sistemas: `step()` devuelve señal —{ golpe: causa } si una
// columna te agarro, 'roce' si te paso cerca, 'salva' si el 4,5" tiro— y game.js decide (el daño lo
// cobra damage.js, el cañonazo lo suena audio.js). Sin audio adentro, el modulo corre en Node: lo usa
// la medicion de balance (tools/balance_defensas.js). Las
// trazadoras van a `missiles` como las de tierra: las mueve y las juzga collision.js.
import { plane } from '../core/state.js';
import { run } from '../core/run.js';
import { missiles } from '../core/world.js';
import { blanco, cajaSistema } from '../core/blanco.js';
import { ARTILLERIA } from '../data/sistemas_buque.js';

const C = ARTILLERIA.C45;
let PZ = 14;
const cols = [];          // { x, z, zPrev, t, vida, salva }
const fogonazos = [];     // { x, t } — el fogonazo en la torre al tirar (la salva TIENE AUTOR)
const relojes = new Map();
let salvas = 0, rumbo = 0;

const gauss = s => s * Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
const reloj = (k, ini) => { if (!relojes.has(k)) relojes.set(k, ini); return relojes.get(k); };

export function reset() { cols.length = 0; fogonazos.length = 0; relojes.clear(); salvas = 0; rumbo = 0; }

/** UNA SALVA del 4,5" `sis`. Apunta a donde vas a estar, con la horquilla de las primeras. */
function salva(sis) {
  const doble = /MK6/.test(sis.nombre), danado = sis.estado === 'danado';
  const n = C.n + (doble ? 1 : 0) - (danado ? 1 : 0);
  // QUEBRAR REINICIA LA CUENTA: si cambiaste de lado desde la salva anterior, el tirador vuelve a tantear
  const r = Math.abs(plane.vx || 0) > 3 ? Math.sign(plane.vx) : 0;
  if (r && rumbo && r !== rumbo) salvas = 0;
  if (r) rumbo = r;
  const lat = salvas < C.horquilla ? C.r * (4 - salvas * 1.6) : 0;
  const lado = Math.random() < 0.5 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const tt = C.t0 + i * C.paso;
    const off = lat * (i % 2 ? 1 : -1) * lado;
    const x = plane.x + (plane.vx || 0) * tt + off + gauss(C.disp);
    const z = PZ + Math.max(30, run.spd) * tt;
    cols.push({ x, z, zPrev: z, t: -i * 0.05, vida: C.vida + tt, salva: salvas });
  }
  salvas++;
  fogonazos.push({ x: cajaSistema(sis).x, t: 0 });
}

/** Un cuadro. `e` = { activo, pz, k }: `activo` lo resuelve el orquestador (pasillo jugable de la
 *  suelta, sin el negro ni la camara lenta, fuera del escape) — el mismo que la defensa cercana. `k`
 *  frena SOLO los relojes de tiro (el ATAQUE COORDINADO, `run.defK`): las columnas viajan con el mundo. */
export function step(dt, e) {
  PZ = e.pz;
  for (const f of fogonazos) f.t += dt;
  while (fogonazos.length && fogonazos[0].t > 0.35) fogonazos.shift();
  let señal = null;
  // LAS COLUMNAS: quietas en el mundo, vienen hacia vos con el agua
  for (const c of cols) {
    c.t += dt; c.zPrev = c.z; c.z -= run.spd * dt;
    if (c.zPrev > PZ && c.z <= PZ && c.t > 0.12) {
      const d = Math.abs(plane.x - c.x), h = C.alto * Math.min(1, c.t / 0.25);
      if (d < C.r && plane.y < h) señal = { golpe: 'death_45' };
      else if (d < C.roce && !señal) señal = 'roce';
    }
  }
  for (let i = cols.length - 1; i >= 0; i--) if (cols[i].t > cols[i].vida || cols[i].z < -10) cols.splice(i, 1);

  const ok = e.activo && blanco.on && !blanco.hundido && !blanco.escapando && blanco.tipo === 'buque';
  if (!ok) { salvas = 0; return señal; }
  for (const sis of blanco.sistemas) {
    if (sis.estado === 'fuera') continue;
    if (sis.tipo === 'canon_45') {
      if (blanco.z < C.desde || blanco.z > C.hasta) continue;
      const t = reloj(sis, C.cada * 0.5) - dt * (e.k || 1);
      if (t <= 0) { salva(sis); relojes.set(sis, C.cada * (sis.estado === 'danado' ? C.lenta : 1)); if (!señal) señal = 'salva'; }
      else relojes.set(sis, t);
      continue;
    }
    const A = ARTILLERIA.AA[sis.tipo];
    if (!A || blanco.z < A.desde || blanco.z > A.hasta) continue;
    const t = reloj(sis, A.cada * Math.random()) - dt * (e.k || 1);
    if (t > 0) { relojes.set(sis, t); continue; }
    relojes.set(sis, A.cada * (0.8 + Math.random() * 0.4));
    const cj = cajaSistema(sis), disp = A.disp * (sis.estado === 'danado' ? 1.6 : 1);
    // `ox`/`oy`: el error de punteria de ESTE tiro. collision.js lo respeta al corregir, asi que la
    // dispersion no se la come el guiado de las trazadoras (casi rectas, pero corrigen un poco)
    for (let i = 0; i < A.n; i++) missiles.push({ tracer: true, x: cj.x, y: cj.y + cj.hy, z: blanco.z + i * 4,
      ox: gauss(disp), oy: gauss(disp * 0.45), done: false });
  }
  return señal;
}

/** LO QUE VE EL RENDER: las columnas (x, z, altura de 0 a 1, edad) y los fogonazos en la torre. */
export function snapshot() {
  return {
    cols: cols.map(c => ({ x: c.x, z: c.z, u: Math.max(0, Math.min(1, c.t / 0.25)), t: c.t, vida: c.vida })),
    fog: fogonazos.map(f => ({ x: f.x, u: f.t / 0.35 })),
    alto: C.alto,
  };
}
