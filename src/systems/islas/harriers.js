// LAS ISLAS REALES — LOS SEA HARRIER COMO AVIONES (20/11, el autor: "la mecanica de los Sea Harriers aca en arena
// tiene que ser igual a un avion comun, pero Harrier persiguiendo y disparando y lanzando misiles; los misiles que
// estan hoy estan bien").
//
// Hasta aca la PAC que te veia te tiraba EL DUELO DEL PASILLO (systems/caza.js): una coreografia en el carril
// —aviso, amagues, sobrepaso— pensada para un pasillo recto. Sobre el mapa real eso no cierra. Ahora cada Harrier
// es un avion EN EL MAPA (x, y absoluta, z), que vuela de verdad:
//   · PERSIGUE: apunta adonde vas a estar (con anticipacion), gira con su radio (GIRO rad/s), sube y baja hacia tu
//     altura sin meterse en el relieve, y va un poco mas rapido que vos. El numeral va abierto al costado.
//   · CAÑON: con la proa encima tuyo (CONO) y cerca (CAÑON_R) FIJA tu punto —el aviso de siempre del pasillo— y
//     larga la rafaga a ese punto: los mismos tiros 'aden' de collision.js. Moverte en el aviso te salva.
//   · MISIL: un poco mas lejos (MISIL_R) te tira EL SIDEWINDER DE HOY (core/aim9.js): de cola si esta atras tuyo,
//     de frente si esta adelante. Se esquiva como siempre (la maniobra en la zona, la poscombustion).
//   · TU CAÑON LO BAJA (HP balas): cae en llamas, girando, y revienta contra el suelo o el agua.
//   · SE VA si entras a nuestra cobertura (teatro.js `retirar`), si te perdio de vista (LEJOS) o pasado TIEMPO:
//     vuelve a su circulo.
// Los tiros salen del punto del CARRIL donde esta el Harrier (la cuenta de islas.js `aMundo`, al reves): el
// pasillo los mueve, los esquiva y los cobra como siempre. Lo dibuja teatro3d.js (la malla del Harrier).
import * as mundo from './mundo.js';
import { missiles, bullets } from '../../core/world.js';
import { plane, stats } from '../../core/state.js';
import { run } from '../../core/run.js';
import { lanzarCola, lanzarFrente } from '../../core/aim9.js';
import { AIM9, ADEN } from '../../data/tuning.js';
import { RAFAGA_ISLAS } from '../../data/islas_teatro.js';
import { beep } from '../audio.js';

const V_MIN = 210, V_MAX = 330, V_K = 1.12;      // m/s: un poco mas rapido que vos
const GIRO = 0.62;                                // rad/s (≈ 350 m de radio a 220 m/s)
const SUBE = 55;                                  // m/s de trepada / picada como mucho
const PISO = 45;                                  // m sobre el relieve (mira 400 m adelante)
const CONO = 0.13, CAÑON_R = 1100, CAÑON_CD = [3.5, 5.5];
const MISIL_R = [900, 3200], MISIL_CONO = 0.4, MISIL_CD = 7;
const HP = 3, LEJOS = 12000, TIEMPO = 150;
// EL CHOQUE EN EL AIRE (21/11, el autor: "los aviones DEBEN PODER COLISIONAR; si chocan mueren ambos (lo choco un Harrier)
// y la IA debe intentar no chocar"). Hasta aca el Harrier te atravesaba. Ahora:
//   · CHOQUE_R: si en el cuadro los dos centros pasan a menos de esto (barrido: a 400 m/s de cierre son 7 m por cuadro),
//     CHOCAN: el Harrier revienta y cae, y vos tambien (islas.js devuelve `death_jet`; el tutorial lo aguanta como
//     cualquier golpe — game.js `onDeath` con `sinMuerte`).
//   · LA IA SE ABRE: si siguiendo como van (las dos velocidades) van a pasar a menos de EVITA_D en los proximos EVITA_T s,
//     el Harrier deja de apuntarte y se aparta —arriba o abajo y para el costado, lejos de donde pasarias— durante
//     EVITA_SOSTIENE s. Gira con su GIRO y sube con su SUBE de siempre, asi que si lo encaras de golpe igual lo chocas.
const CHOQUE_R = 9;                                // m (medias envergaduras: A-4 ~4,2 + Sea Harrier ~3,9)
// (medido en Node contra este archivo, 400 encuentros a 230 m/s: sin la IA, con tirones de altura del jugador 1 de cada 3
// termina en choque; con estos numeros, menos de 1 en 100 — pasa cerca, a menos de 30 m, en 1 de cada 3. Mas EVITA_T o
// EVITA_D lo vuelven intocable; menos EVITA_MIRA, mas atento)
const EVITA_T = 1.2, EVITA_D = 40, EVITA_SOSTIENE = 1, EVITA_MIRA = 0.5;
const H = [];          // los Harriers en el aire
let ult = null;        // tu posicion del cuadro anterior (tu velocidad)
let chocado = false;   // un Harrier te choco este cuadro (islas.js `tomarChoque` lo cobra)
/** ¿Te choco un Harrier? (y se borra) — islas.js lo vuelve la causa de muerte `death_jet`. */
export function tomarChoque() { const c = chocado; chocado = false; return c; }
/** La distancia minima al origen del segmento a→b (el barrido de lo relativo en un cuadro). */
function minSeg(ax, ay, az, bx, by, bz) {
  const dx = bx - ax, dy = by - ay, dz = bz - az, L = dx * dx + dy * dy + dz * dz;
  const u = L > 1e-9 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy + az * dz) / L)) : 0;
  return Math.hypot(ax + dx * u, ay + dy * u, az + dz * u);
}
const rnd = (a, b) => a + Math.random() * (b - a);
const envolver = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

export function reiniciar() { H.length = 0; ult = null; chocado = false; }
export const activo = () => H.some(h => h.fase !== 'cae');
/** Los de la PAC `c`: cuantos vuelan (persiguiendo o volviendo) y cuantos bajaste. */
export function estadoDe(c) {
  let vivos = 0, bajados = 0, cayendo = 0;
  for (const h of H) if (h.pac === c) { if (h.fase === 'cae') cayendo++; else vivos++; }
  bajados = (c.__bajados || 0);
  return { vivos, bajados, cayendo };
}

/** La PAC `c` te salta encima: sus `n` aviones, desde donde estan (`aviones` de teatro.js). */
export function soltar(c, aviones, n) {
  for (let i = 0; i < n; i++) {
    const a = aviones[i] && aviones[i].x !== undefined ? aviones[i] : { x: c.x, z: c.z, y: c.alt, yaw: 0 };
    H.push({ pac: c, i, x: a.x, y: a.y, z: a.z, yaw: a.yaw, roll: 0, pitch: 0, v: 230, hp: HP, fase: 'caza', t: 0,
      gunCD: rnd(1.5, 3), misCD: rnd(2, 4), aim9: AIM9.POR_HARRIER, rafaga: null, cae: null });
  }
  c.__bajados = 0;
}
/** Todos se van a su circulo (entraste a nuestra cobertura). */
export function retirar() { for (const h of H) if (h.fase === 'caza') { h.fase = 'vuelve'; h.rafaga = null; } }

/** UN CUADRO. `P` = el avion en el mapa ({ x, z, g, yaw, y }), `pz` = su profundidad en el carril, `boom` = la
 *  explosion 3D (islas.js `estallido`). Devuelve eventos: [{ k: 'bajado' | 'volvio' | 'choque', c }]. */
export function paso(dt, P, pz, boom, jugando) {
  const out = [];
  if (!H.length) { ult = null; return out; }
  const yo = { x: P.x, y: P.g + P.y, z: P.z };
  const vel = ult && dt > 0 ? { x: (yo.x - ult.x) / dt, y: (yo.y - ult.y) / dt, z: (yo.z - ult.z) / dt } : { x: 0, y: 0, z: 0 };
  const salto = Math.hypot(vel.x, vel.z) > 900;
  if (salto) { vel.x = vel.y = vel.z = 0; }   // (un salto de la sonda no es velocidad)
  const antes = salto ? null : ult;           // (para el choque barrido: donde estabas el cuadro anterior)
  ult = yo;
  const vYo = Math.hypot(vel.x, vel.z);
  const sy = Math.sin(P.yaw), cy = Math.cos(P.yaw);
  const carril = (x, y, z) => { const dx = x - P.x, dz = z - P.z; return { x: plane.x + cy * dx + sy * dz, y: y - P.g, z: sy * dx - cy * dz + pz }; };
  for (let i = H.length - 1; i >= 0; i--) {
    const h = H[i];
    h.t += dt;
    if (h.fase === 'cae') {
      // EN LLAMAS: sigue de largo, pica y gira; revienta al tocar
      h.cae.vy -= 22 * dt; h.y += h.cae.vy * dt;
      h.x += Math.sin(h.yaw) * h.v * 0.8 * dt; h.z -= Math.cos(h.yaw) * h.v * 0.8 * dt;
      h.roll += h.cae.giro * dt; h.pitch = Math.max(-1.1, h.pitch - dt * 0.6);
      h.cae.humo -= dt;
      if (h.cae.humo <= 0) { h.cae.humo = 0.12; boom(h.x, h.y, h.z, 0.25, 'fuego', 0, 0); }
      const suelo = Math.max(mundo.sueloH(h.x, h.z), 0);
      if (h.y <= suelo + 1) { boom(h.x, suelo + 2, h.z, 1.6, suelo > 0.3 ? 'avion' : 'agua', 0, 0); H.splice(i, 1); }
      continue;
    }
    // ¿A DONDE VA? En caza, a donde vas a estar (el numeral, abierto al costado); volviendo, a su circulo
    let meta;
    const dx0 = yo.x - h.x, dz0 = yo.z - h.z, dist = Math.hypot(dx0, dz0, yo.y - h.y);
    if (h.fase === 'caza' && (dist > LEJOS || h.t > TIEMPO || !jugando)) { h.fase = 'vuelve'; h.rafaga = null; }
    if (h.fase === 'caza') {
      const lead = Math.min(2.2, dist / Math.max(150, h.v));
      meta = { x: yo.x + vel.x * lead, y: yo.y + vel.y * lead * 0.5 + 10, z: yo.z + vel.z * lead };
      if (h.i) { const ly = Math.atan2(vel.x, -vel.z) || P.yaw; meta.x += Math.cos(ly) * 160; meta.z += Math.sin(ly) * 160; }
      h.v += (Math.min(V_MAX, Math.max(V_MIN, vYo * V_K)) - h.v) * Math.min(1, dt * 0.8);
    } else {
      meta = { x: h.pac.x, y: h.pac.alt, z: h.pac.z };
      h.v += (240 - h.v) * Math.min(1, dt * 0.5);
      if (Math.hypot(meta.x - h.x, meta.z - h.z) < 600) { out.push({ k: 'volvio', c: h.pac }); H.splice(i, 1); continue; }
    }
    // LA IA SE ABRE (21/11, ver EVITA_*): siguiendo como van los dos, ¿a cuanto pasan y cuando? Si es pegado y pronto,
    // en vez de apuntarte se aparta hacia el lado (y la altura) en que ya iba a pasar, para agrandar la distancia
    h.miraT = (h.miraT || 0) - dt;
    if (jugando && h.miraT <= 0) {
      h.miraT = EVITA_MIRA;   // (no lo ve en cada cuadro: el piloto tarda en darse cuenta)
      const rx = h.x - yo.x, ry = h.y - yo.y, rz = h.z - yo.z;
      const wx = Math.sin(h.yaw) * h.v - vel.x, wy = (h.vy || 0) - vel.y, wz = -Math.cos(h.yaw) * h.v - vel.z;
      const w2 = wx * wx + wy * wy + wz * wz, tca = w2 > 1 ? -(rx * wx + ry * wy + rz * wz) / w2 : -1;
      if (tca > 0 && tca < EVITA_T) {
        const mx = rx + wx * tca, my = ry + wy * tca, mz = rz + wz * tca;
        if (Math.hypot(mx, my, mz) < EVITA_D) {
          const mh = Math.hypot(mx, mz), lado = h.i ? -1 : 1;   // (de frente y justo encima: cada numeral a un costado)
          const bajo = h.y - 70 < Math.max(mundo.sueloH(h.x, h.z), 0) + PISO;   // (abajo no hay lugar: por arriba)
          h.evita = { t: EVITA_SOSTIENE, ux: mh > 3 ? mx / mh : Math.cos(h.yaw) * lado, uz: mh > 3 ? mz / mh : Math.sin(h.yaw) * lado,
            sube: my >= -3 || bajo ? 1 : -1 };
        }
      }
    }
    if (h.evita) {
      const e = h.evita;
      e.t -= dt;
      meta = { x: h.x + Math.sin(h.yaw) * 600 + e.ux * 500, y: h.y + e.sube * 90, z: h.z - Math.cos(h.yaw) * 600 + e.uz * 500 };
      if (e.t <= 0) h.evita = null;
    }
    const hx0 = h.x, hy0 = h.y, hz0 = h.z;   // (para el choque barrido)
    // EL GIRO: rumbo hacia la meta con su tope, y el alabeo que lo acompaña
    const quiere = Math.atan2(meta.x - h.x, -(meta.z - h.z)), dif = envolver(quiere - h.yaw);
    const giro = Math.max(-GIRO * dt, Math.min(GIRO * dt, dif));
    h.yaw = envolver(h.yaw + giro);
    h.roll += (Math.max(-1.2, Math.min(1.2, dif * 2.2)) - h.roll) * Math.min(1, dt * 3);
    // LA ALTURA: hacia la meta, sin meterse en el relieve (mira adelante)
    const fx = Math.sin(h.yaw), fz = -Math.cos(h.yaw);
    const piso = Math.max(mundo.sueloH(h.x, h.z), mundo.sueloH(h.x + fx * 400, h.z + fz * 400), 0) + PISO;
    const yMeta = Math.max(meta.y, piso);
    const vy = Math.max(-SUBE, Math.min(SUBE, (yMeta - h.y) * 1.2));
    h.pitch += (Math.atan2(vy, h.v) - h.pitch) * Math.min(1, dt * 3);
    h.x += fx * h.v * dt; h.z += fz * h.v * dt; h.y += vy * dt; h.vy = vy;
    // EL CHOQUE (21/11, ver CHOQUE_R): lo relativo barrido en el cuadro (de donde estaban los dos a donde estan). Mueren
    // los dos: el Harrier revienta y cae en llamas, y vos lo cobras en islas.js (`tomarChoque` → death_jet)
    if (jugando && !chocado) {
      const d = antes ? minSeg(hx0 - antes.x, hy0 - antes.y, hz0 - antes.z, h.x - yo.x, h.y - yo.y, h.z - yo.z)
        : Math.hypot(h.x - yo.x, h.y - yo.y, h.z - yo.z);
      if (d < CHOQUE_R) {
        chocado = true;
        h.fase = 'cae'; h.rafaga = null; h.evita = null; h.cae = { vy: -12, giro: (Math.random() < 0.5 ? -1 : 1) * 3.5, humo: 0 };
        h.pac.__bajados = (h.pac.__bajados || 0) + 1;
        boom(h.x, h.y, h.z, 1.6, 'avion', 0, 0);
        out.push({ k: 'choque', c: h.pac });   // (no es un derribo tuyo: sin puntos ni cartel de BAJADO)
        continue;
      }
    }
    if (h.fase !== 'caza' || !jugando) continue;
    // ---- LOS TIROS ----
    const aMi = Math.atan2(dx0, -dz0), apunta = Math.abs(envolver(aMi - h.yaw));
    h.gunCD -= dt; h.misCD -= dt;
    // EL CAÑON: fija tu punto (el aviso) y despues la rafaga a ese punto
    if (!h.rafaga && h.gunCD <= 0 && dist < CAÑON_R && apunta < CONO) {
      h.rafaga = { tx: plane.x, ty: plane.y, t: 0, n: 0 };
      beep(980, 0.06, 'square', 0.04);
    }
    if (h.rafaga) {
      const r = h.rafaga;
      r.t += dt;
      if (r.n < RAFAGA_ISLAS && r.t >= ADEN.AVISO + r.n * ADEN.GAP) {
        r.n++;
        const c = carril(h.x, h.y, h.z);
        missiles.push({ tipo: 'aden', x0: c.x, y0: c.y, z0: c.z, x: c.x, y: c.y, z: c.z, tx: r.tx, ty: r.ty, t: 0, done: false });
        beep(160, 0.07, 'square', 0.06, 90);
      }
      if (r.n >= RAFAGA_ISLAS) { h.rafaga = null; h.gunCD = rnd(CAÑON_CD[0], CAÑON_CD[1]); }
    }
    // EL SIDEWINDER (el de hoy): de cola si esta atras tuyo, de frente si esta adelante
    if (h.aim9 > 0 && h.misCD <= 0 && dist > MISIL_R[0] && dist < MISIL_R[1] && apunta < MISIL_CONO) {
      const c = carril(h.x, h.y, h.z), b = { x: plane.x, y: plane.y, vx: plane.vx, vy: plane.vy || 0, spd: run.spd, pz };
      const m = c.z < pz ? lanzarCola({ x: c.x, y: c.y, z: Math.max(c.z, pz - 120) }, b, AIM9, null) : lanzarFrente(c, b);
      missiles.push(m);
      h.aim9--; h.misCD = MISIL_CD;
      beep(220, 0.32, 'sawtooth', 0.05, 900);   // el siseo del motor cohete
    }
  }
  // ---- TUS BALAS (las ancla islas.js al mapa: `__islasB`) ----
  for (const bl of bullets) {
    const q = bl.__islasB;
    if (!q || bl.done) continue;
    const by = P.g + (bl.y || 0);
    for (const h of H) {
      if (h.fase === 'cae' || Math.hypot(q.x - h.x, q.z - h.z) > 9 || Math.abs(by - h.y) > 7) continue;
      bl.done = true; h.hp--;
      boom(h.x, h.y, h.z, 0.3, 'fuego', 0, 0);
      if (h.hp <= 0) {
        h.fase = 'cae'; h.rafaga = null; h.cae = { vy: -5, giro: (Math.random() < 0.5 ? -1 : 1) * 2.5, humo: 0 };
        h.pac.__bajados = (h.pac.__bajados || 0) + 1;
        stats.harriers++;   // (el ALBUM: la cabina del Sea Harrier sale a los 20 — game.js)
        boom(h.x, h.y, h.z, 1.1, 'avion', 0, 0);
        out.push({ k: 'bajado', c: h.pac });
      }
      break;
    }
  }
  return out;
}

/** Para teatro3d.js: donde esta cada uno y su actitud. */
export const escena = () => H.map(h => ({ x: h.x, y: h.y, z: h.z, yaw: h.yaw, roll: h.roll, pitch: h.pitch, cae: h.fase === 'cae' }));

/** EL AVISO de la rafaga (el punto fijado, en el carril) para el dibujo del pasillo (render/caza.js `drawAvisoAden`). */
export const avisos = () => H.filter(h => h.rafaga && h.rafaga.n === 0).map(h => ({ x: h.rafaga.tx, y: h.rafaga.ty, u: Math.min(1, h.rafaga.t / ADEN.AVISO) }));

// SONDA
if (typeof window !== 'undefined') window.__harriers = () => JSON.stringify(H.map(h => ({ f: h.fase, hp: h.hp, aim9: h.aim9, v: h.v | 0,
  d: ult ? Math.round(Math.hypot(h.x - ult.x, h.z - ult.z)) : null, y: h.y | 0 })));
