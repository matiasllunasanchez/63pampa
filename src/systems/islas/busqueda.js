// LA BUSQUEDA EN EL MAR (libro de vuelo r6, EL RESCATE DEL BELGRANO). Los numeros y la historia: data/busqueda.js.
// Puro de estado: lo llama systems/islas/islas.js (en coordenadas LOCALES del mapa: x al este, z al sur, metros) y
// lo dibuja systems/islas/busqueda3d.js. Los avisos salen como eventos (`tomarEventos`) y game.js los vuelve
// carteles y radio.
//
// LAS BENGALAS (26/11, el autor: "en ISLA debe haber varias zonas de busqueda… deben ser visibles las bengalas y yo debo
// tirar radar, seguir bengalas hasta alguna de esas; 5 ubicaciones aleatorias y una de ellas es la mancha con las
// balsas"): BUSQ.BENGALAS lugares al azar en la zona, cada uno con una bengala que se ve de lejos; la mancha esta en
// uno. Con el radar PRENDIDO a menos de BENGALA_R de una bengala (y arriba de RADAR_ALT), BENGALA_S segundos: si es la
// de la mancha, aparece; si no, la bengala se apaga (SIN CONTACTO). La mancha tambien se ve a ojo, pasando encima.
// LAS FASES:
//   'mancha'    seguir las bengalas y barrer con el radar hasta dar con la MANCHA DE ACEITE (los indicios falsos engañan)
//   'balsas'    la mancha se corre al SE: las BALSAS estan mas alla de su punta, derivando
//   'marcar'    las viste: tirale HUMO encima antes de alejarte, o se pierden (derivan y hay que volver a verlas)
//   'circulos'  marcadas: SUBI y da VUELTAS sobre el humo para que el destructor te tome
//   'hecho'     el destructor va para alla: a casa, con la nafta que quede
// Sin `encuentra` (el 2-P-112, la noche): 'barrido' — cubrir los sectores de la zona; no hay mancha (no la vio).
import { BUSQ, INDICIOS } from '../../data/busqueda.js';

const B = { on: false, fase: null, cx: 0, cz: 0, ind: [], mancha: null, balsas: null, humos: [], quedan: 0,
  vueltas: 0, yawAnt: null, ev: [], sect: null, encuentra: true, lejosT: 0 };

// azar con semilla: la misma salida, la misma zona (como el pasillo con `sembrarAzar`)
let sem = 1;
const rnd = () => { sem = (Math.imul(sem, 1103515245) + 12345) >>> 0; return sem / 4294967296; };
const DEG = Math.PI / 180;
/** el rumbo (0 = norte, horario) como direccion en el mapa: x al este, z al SUR */
const dir = r => [Math.sin(r), -Math.cos(r)];

export const activa = () => B.on;
export const fase = () => (B.on ? B.fase : null);
export const hecho = () => B.on && B.fase === 'hecho';
export function apagar() { B.on = false; B.fase = null; B.ev.length = 0; }

/** Arma la zona adelante de (x, z) con rumbo `yaw`. `encuentra` false = la salida que no vio nada (el 2-P-112). */
export function armar(x, z, yaw, { encuentra = true, semilla = 1 } = {}) {
  sem = semilla >>> 0 || 1;
  const [fx, fz] = dir(yaw);
  B.on = true; B.encuentra = encuentra; B.cx = x + fx * BUSQ.ZONA_A; B.cz = z + fz * BUSQ.ZONA_A;
  B.fase = encuentra ? 'mancha' : 'barrido';
  B.quedan = BUSQ.HUMOS; B.humos = []; B.vueltas = 0; B.yawAnt = null; B.ev.length = 0; B.lejosT = 0;
  // LOS INDICIOS FALSOS, repartidos por la zona (ninguno pegado a la entrada)
  B.ind = [];
  for (let i = 0; i < BUSQ.INDICIOS_N; i++) {
    const a = rnd() * Math.PI * 2, r = 900 + rnd() * (BUSQ.ZONA_R - 1500), t = INDICIOS[i % INDICIOS.length];
    B.ind.push({ ...t, x: B.cx + Math.cos(a) * r, z: B.cz + Math.sin(a) * r, rot: rnd() * Math.PI, visto: false });
  }
  B.mancha = null; B.balsas = null;
  // LAS BENGALAS: separadas entre si, ninguna pegada a la entrada
  B.beng = [];
  for (let t = 0; B.beng.length < BUSQ.BENGALAS && t < 400; t++) {
    const a = rnd() * Math.PI * 2, r = BUSQ.BENGALA_D[0] + rnd() * (BUSQ.BENGALA_D[1] - BUSQ.BENGALA_D[0]);
    const bx = B.cx + Math.cos(a) * r, bz = B.cz + Math.sin(a) * r;
    if (Math.hypot(bx - x, bz - z) < BUSQ.BENGALA_SEP) continue;
    if (B.beng.some(q => Math.hypot(q.x - bx, q.z - bz) < BUSQ.BENGALA_SEP)) continue;
    B.beng.push({ x: bx, z: bz, viva: true, barrido: 0, f: rnd() * 30 });
  }
  B.bengMancha = encuentra ? Math.floor(rnd() * B.beng.length) : -1;
  if (encuentra) {
    // LA MANCHA: en la bengala que le toco, y se estira hacia el SE
    const q = B.beng[B.bengMancha];
    const mx = q.x, mz = q.z, [sx, sz] = dir(BUSQ.MANCHA_RUMBO * DEG);
    B.mancha = { x0: mx, z0: mz, x1: mx + sx * BUSQ.MANCHA_LARGO, z1: mz + sz * BUSQ.MANCHA_LARGO, ancho: BUSQ.MANCHA_ANCHO, rot: BUSQ.MANCHA_RUMBO * DEG, vista: false };
    // LAS BALSAS: mas alla de la punta SE, derivando
    const dv = BUSQ.DERIVA[0] + rnd() * (BUSQ.DERIVA[1] - BUSQ.DERIVA[0]), ga = (BUSQ.MANCHA_RUMBO + (rnd() - 0.5) * 40) * DEG, [gx, gz] = dir(ga);
    B.balsas = { x: B.mancha.x1 + gx * dv, z: B.mancha.z1 + gz * dv, vistas: false, marcadas: false, lista: [] };
    armarRacimo();
  } else {
    // EL BARRIDO: ocho sectores de la zona (el anillo de 1,5 km al borde); cada uno se cuenta al pasarlo bajo el techo
    B.sect = Array(8).fill(false);
  }
}
function armarRacimo() {
  const b = B.balsas; b.lista = [];
  for (let i = 0; i < BUSQ.BALSAS_N; i++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * BUSQ.RACIMO;
    b.lista.push({ x: b.x + Math.cos(a) * r, z: b.z + Math.sin(a) * r, rot: rnd() * Math.PI, f: rnd() * 6 });
  }
}

/** Cuanto se ve desde `alto` m sobre el mar: nada adentro de la nube; mas abajo, mas lejos. */
export function vista(alto) {
  if (alto >= BUSQ.TECHO) return 0;
  const k = Math.max(0, Math.min(1, (alto - BUSQ.BAJO) / (BUSQ.TECHO - BUSQ.BAJO)));
  return BUSQ.VISTA_BAJO + (BUSQ.VISTA - BUSQ.VISTA_BAJO) * k;
}
/** distancia de (x, z) al segmento de la mancha */
function aMancha(x, z) {
  const m = B.mancha, vx = m.x1 - m.x0, vz = m.z1 - m.z0, L2 = vx * vx + vz * vz;
  const t = Math.max(0, Math.min(1, ((x - m.x0) * vx + (z - m.z0) * vz) / L2));
  return Math.hypot(x - (m.x0 + vx * t), z - (m.z0 + vz * t));
}

/** Un cuadro. `a` = { x, z, yaw, alto (m sobre el mar), suelta (true el cuadro en que se aprieta el humo), dt }. */
export function paso(dt, a) {
  if (!B.on) return;
  B.ult = a;   // (la sonda `__busqueda('aca')`)
  const v = vista(a.alto);
  for (const h of B.humos) h.t += dt;
  B.humos = B.humos.filter(h => h.t < BUSQ.HUMO_S);
  // LOS INDICIOS: se ven una vez y se dicen (no son)
  if (v > 0) for (const i of B.ind) if (!i.visto && Math.hypot(i.x - a.x, i.z - a.z) < v + i.t) { i.visto = true; B.ev.push({ k: 'indicio', id: i.id }); }
  // EL HUMO: lo que sale cae un poco adelante (el avion sigue)
  if (a.suelta) {
    if (B.quedan <= 0) B.ev.push({ k: 'sinHumo' });
    else {
      B.quedan--;
      const [fx, fz] = dir(a.yaw), hx = a.x + fx * 60, hz = a.z + fz * 60;
      B.humos.push({ x: hx, z: hz, t: 0 });
      const cerca = B.balsas && B.balsas.vistas && Math.hypot(hx - B.balsas.x, hz - B.balsas.z) < BUSQ.MARCA;
      B.ev.push({ k: 'humo', ok: !!cerca, quedan: B.quedan });
      if (cerca && !B.balsas.marcadas) { B.balsas.marcadas = true; B.fase = 'circulos'; B.ev.push({ k: 'marcadas' }); }
    }
  }
  if (B.fase === 'mancha' && v > 0 && aMancha(a.x, a.z) < v + B.mancha.ancho / 2) {
    B.mancha.vista = true; B.fase = 'balsas'; B.ev.push({ k: 'mancha' });
  }
  // EL RADAR CERCA DE UNA BENGALA (ver arriba): descarta la bengala o encuentra la mancha
  if ((B.fase === 'mancha' || B.fase === 'barrido') && a.radar && a.alto >= BUSQ.RADAR_ALT) {
    for (let i = 0; i < B.beng.length; i++) {
      const q = B.beng[i];
      if (!q.viva || Math.hypot(q.x - a.x, q.z - a.z) > BUSQ.BENGALA_R) continue;
      q.barrido += dt;
      if (q.barrido < BUSQ.BENGALA_S) continue;
      q.viva = false;
      if (i === B.bengMancha && B.fase === 'mancha') { B.mancha.vista = true; B.fase = 'balsas'; B.ev.push({ k: 'mancha', radar: true }); }
      else B.ev.push({ k: 'bengalaVacia', quedan: B.beng.filter(z => z.viva).length });
      break;
    }
  }
  if ((B.fase === 'balsas' || B.fase === 'marcar') && B.balsas) {
    const d = Math.hypot(B.balsas.x - a.x, B.balsas.z - a.z);
    // (y DONDE, en horas de reloj desde la trompa — el «¡Balsa a las 11!» del 2-P-111, segun el libro del autor)
    if (B.fase === 'balsas' && v > 0 && d < v + BUSQ.RACIMO) {
      let rel = Math.atan2(B.balsas.x - a.x, -(B.balsas.z - a.z)) - a.yaw;
      rel = ((rel % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      B.balsas.vistas = true; B.fase = 'marcar'; B.ev.push({ k: 'balsas', reloj: Math.round(rel / (Math.PI / 6)) % 12 || 12 });
    }
    // SIN HUMO SE PIERDEN: lejos de las balsas vistas y sin marcar, derivan y hay que volver a encontrarlas
    if (B.fase === 'marcar' && d > BUSQ.PIERDE) {
      const [gx, gz] = dir((BUSQ.MANCHA_RUMBO + (rnd() - 0.5) * 60) * DEG);
      B.balsas.x += gx * BUSQ.DERIVA_PERDIDA; B.balsas.z += gz * BUSQ.DERIVA_PERDIDA; armarRacimo();
      B.balsas.vistas = false; B.fase = 'balsas'; B.ev.push({ k: 'perdidas' });
    }
  }
  // LOS CIRCULOS: arriba y cerca del humo que las marca, cada vuelta de rumbo suma
  if (B.fase === 'circulos') {
    const h = B.humos.length ? B.humos.reduce((m, q) => (Math.hypot(q.x - B.balsas.x, q.z - B.balsas.z) < Math.hypot(m.x - B.balsas.x, m.z - B.balsas.z) ? q : m)) : B.balsas;
    const ok = a.alto >= BUSQ.CIRCULO_ALT && Math.hypot(h.x - a.x, h.z - a.z) < BUSQ.CIRCULO_R;
    if (B.yawAnt !== null && ok) {
      let d = a.yaw - B.yawAnt; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
      B.vueltas += Math.abs(d) / (Math.PI * 2);
    }
    B.yawAnt = a.yaw;
    if (B.vueltas >= BUSQ.VUELTAS) { B.fase = 'hecho'; B.ev.push({ k: 'tomadas' }); }
  }
  // EL BARRIDO (sin mancha): los sectores del anillo, pasados bajo el techo
  if (B.fase === 'barrido' && v > 0) {
    const dx = a.x - B.cx, dz = a.z - B.cz, r = Math.hypot(dx, dz);
    if (r > 1500 && r < BUSQ.ZONA_R) {
      const s = Math.floor(((Math.atan2(dx, -dz) / (Math.PI * 2)) + 1) % 1 * 8);
      if (!B.sect[s]) { B.sect[s] = true; B.ev.push({ k: 'sector', n: B.sect.filter(Boolean).length }); }
      if (B.sect.every(Boolean)) { B.fase = 'hecho'; B.ev.push({ k: 'barrido' }); }
    }
  }
  // FUERA DE LA ZONA, el aviso (una vez cada tanto)
  const fuera = Math.hypot(a.x - B.cx, a.z - B.cz) > BUSQ.ZONA_R && B.fase !== 'hecho';
  B.lejosT = fuera ? B.lejosT + dt : 0;
  if (fuera && B.lejosT > 0 && B.lejosT - dt <= 0) B.ev.push({ k: 'fuera' });
}

export const tomarEventos = () => B.ev.splice(0);

/** Hacia donde marca la brujula: el centro de la zona; el humo que las marca en los circulos. null si nada. */
export function blanco() {
  // (26/11, el autor: "no debe aparecer el cuadradito"): sin marca de zona — se siguen las bengalas, la mancha y el humo
  return null;
}

/** Lo que muestra el tablero: la fase, los humos que quedan, el progreso (circulos o barrido). */
export function hud() {
  if (!B.on) return null;
  const prog = B.fase === 'circulos' ? Math.min(1, B.vueltas / BUSQ.VUELTAS)
    : B.fase === 'barrido' ? B.sect.filter(Boolean).length / 8 : null;
  return { fase: B.fase, humos: B.quedan, prog };
}

/** Para el dibujo 3D (busqueda3d.js) y el mapa: lo que hay en el agua. Las balsas, solo una vez vistas. */
export function escena() {
  if (!B.on) return null;
  return { mancha: B.mancha, ind: B.ind, humos: B.humos, zona: { x: B.cx, z: B.cz, r: BUSQ.ZONA_R }, bengalas: B.beng,
    balsas: B.balsas ? B.balsas.lista : null };
}

/** La sonda: el estado entero (tools / __busqueda) */
export const debug = () => ({ fase: B.fase, c: [Math.round(B.cx), Math.round(B.cz)], mancha: B.mancha && [Math.round(B.mancha.x0), Math.round(B.mancha.z0), Math.round(B.mancha.x1), Math.round(B.mancha.z1)],
  balsas: B.balsas && [Math.round(B.balsas.x), Math.round(B.balsas.z), B.balsas.vistas, B.balsas.marcadas], humos: B.quedan, vueltas: +B.vueltas.toFixed(2), sect: B.sect,
  beng: B.beng && B.beng.map(q => [Math.round(q.x), Math.round(q.z), q.viva]), bengMancha: B.bengMancha });

// SONDA: __busqueda() el estado; __busqueda('mancha'|'balsas') te lleva encima (para probar sin barrer)
if (typeof window !== 'undefined') window.__busqueda = q => {
  if (q === 'mancha' && B.mancha) return JSON.stringify({ x: B.mancha.x0, z: B.mancha.z0 });
  if (q === 'balsas' && B.balsas) return JSON.stringify({ x: B.balsas.x, z: B.balsas.z });
  // 'aca': las balsas vistas, AD m adelante de la trompa (para mirarlas sin buscarlas)
  if (q === 'aca' && B.balsas && B.ult) {
    const [fx, fz] = dir(B.ult.yaw); B.balsas.x = B.ult.x + fx * 220; B.balsas.z = B.ult.z + fz * 220; armarRacimo();
    B.balsas.vistas = true; return 'ok';
  }
  return JSON.stringify(debug());
};
