// LAS ISLAS REALES — EL TEATRO (prototipo I1, docs/proyecto/PLAN_TEATRO_MALVINAS.md): las bases britanicas y
// argentinas, los buques de la Bahia San Carlos y las PAC de Harriers del 24 de mayo, puestos sobre el mapa real.
// El orden de batalla vive en data/islas_teatro.js; esto lo ARMA (cada pieza acomodada al terreno), lo MUEVE
// (las PAC en circulo u ocho, los buques de piquete, los soldados en ronda), decide los TIROS (los britanicos te
// tiran con las armas del pasillo) y recibe los GOLPES (balas y bombas). Lo dibuja teatro3d.js.
//
// COMO TIRA UN BRITANICO: el pasillo resuelve los misiles en SU carril, que va pegado al avion y mira a donde mira
// el. Asi que el tiro sale del punto del carril donde cae la pieza (la cuenta de islas.js `aMundo`, al reves) y de
// ahi en mas es un misil del pasillo: se mueve, se esquiva y pega como siempre (systems/collision.js). Solo tira lo
// que esta ADELANTE y en un cono: lo de atras no te alcanza (el misil del pasillo viene de frente).
//
// LA PAC te ve a PAC_VE metros: rompe el circulo y te salta encima — dos Sea Harrier que vuelan DE VERDAD sobre el
// mapa (systems/islas/harriers.js, 20/11: antes era el duelo del pasillo, systems/caza.js). Los que bajes no
// vuelven; los que se van vuelven a su circulo.
//
// LAS ZONAS DE RADAR (20/11, data/islas_teatro.js RADARES): adentro de una britanica y arriba de RADAR_BAJO te
// ven, y la PAC mas cercana VIENE (estado 'vector') hasta tenerte a ojo; si el radar te pierde PAC_OLVIDA s, vuelve
// a su circulo. Adentro de la nuestra los Harriers no entran: los que te perseguian se van (harriers.js `retirar`).
import * as mundo from './mundo.js';
import { BASES, BUQUES, PAC, ARMAS, PAC_VE, PAC_VUELVE, RADARES, RADAR_BAJO, PAC_VECTOR, PAC_VEL_VECTOR, PAC_OLVIDA, DEFENSA, DANADO_MIN, BOMBA, FUSILES } from '../../data/islas_teatro.js';
import { missiles, pmissiles, bullets } from '../../core/world.js';
import * as harriers from './harriers.js';
import { posBomba } from './objetivo.js';
import { beep, sfxOne, salpicon } from '../audio.js';
import * as soldados from './soldados.js';

// LA HUELLA de cada pieza en metros (radio para balas y bombas, alto) y sus golpes
const HUELLA = {
  carpa: { r: 7, h: 4, hp: 2 }, deposito: { r: 11, h: 7, hp: 4 }, puesto: { r: 6, h: 6, hp: 3 }, radar: { r: 7, h: 8, hp: 2 },
  rapier: { r: 8, h: 4, hp: 2 }, manpad: { r: 4, h: 2, hp: 1 }, canon: { r: 6, h: 4, hp: 2 }, camion: { r: 6, h: 4, hp: 2 },
  pucara: { r: 9, h: 5, hp: 2 }, herc: { r: 18, h: 11, hp: 4 }, blindado: { r: 6, h: 4, hp: 3 },
};
// la MALLA de cada pieza (assets/mallas)
const MALLA = { carpa: 'carpa', deposito: 'deposito', puesto: 'puesto', radar: 'radar', rapier: 'nido_rapier', manpad: 'manpad',
  canon: 'camion_aa', camion: 'camion_aa', blindado: 'camion_aa', pucara: 'pucara', herc: 'herc', soldado: 'soldado_corre', harrier: 'harrier' };
export const mallaDe = tipo => MALLA[tipo] || tipo;

const RED_SOBRE = 3500;   // m: la red del radar se ve volando ENCIMA de el
export const RED_ARG_T = 5; // s: la nuestra, al entrar a la zona (el cartel, 3 s, y 2 s mas)
export const fuegoCerca = () => !!(T.armado && T.fuego && T.fuegoT > 0);
/** (sonda) el buque britanico vivo mas cercano a (x, z) */
export const buqueCerca = (x, z) => T.buques.filter(b => b.vivo && b.bando === 'gb').sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z))[0] || null;
const T = { armado: false, piezas: [], buques: [], pac: [], soldados: [], trincheras: [], banderas: [], t: 0, radares: [], zona: { gb: null, arg: null, visto: false }, vistoT: 99, eventos: [] };
let semilla = 1;
const rnd = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);

export function reiniciar() {
  // (los grupos 3D que dejo teatro3d.js se sacan de la escena: el teatro nuevo arma los suyos)
  const fuera = o => { if (o && o.__g && o.__g.parent) o.__g.parent.remove(o.__g); };
  for (const o of [...T.piezas, ...T.buques]) fuera(o);
  for (const x of [...T.soldados, ...T.pac]) for (const o of x.__gs || []) fuera(o);
  for (const x of T.soldados) for (const g of Object.values(x.__p || {})) if (g.parent) g.parent.remove(g);
  for (const o of [...T.trincheras, ...T.banderas]) fuera(o);
  T.trincheras.length = T.banderas.length = 0;
  harriers.reiniciar();
  T.armado = false; T.piezas.length = T.buques.length = T.pac.length = T.soldados.length = T.radares.length = 0; T.t = 0; T.bases = [];
  T.zona = { gb: null, arg: null, visto: false }; T.vistoT = 99; T.eventos.length = 0;
}

const plano = (x, z, rad) => {
  const h = mundo.sueloH(x, z);
  if (h < 1.5) return -1;
  let d = 0;
  for (const [a, b] of [[rad, 0], [-rad, 0], [0, rad], [0, -rad]]) d = Math.max(d, Math.abs(mundo.sueloH(x + a, z + b) - h));
  return d < Math.max(3, rad * 0.35) ? h : -1;
};
/** Suelo plano cerca de (x, z): busca en anillos hasta `max` metros. */
function tierraCerca(x, z, rad, max = 900) {
  for (let r = 0; r <= max; r += 40) {
    const n = r ? Math.max(8, Math.round(r / 25)) : 1;
    const a0 = rnd() * 6.283;
    for (let k = 0; k < n; k++) {
      const a = a0 + k / n * 6.283, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r, h = plano(px, pz, rad);
      if (h >= 0) return [px, pz, h];
    }
  }
  return null;
}
const hondo = (x, z) => { const o = mundo.org(); return mundo.mapH(x + o[0], z + o[1]); };
/** Agua cerca de (x, z) para un buque de `largo` m con rumbo `rot`: agua en el centro y en proa y popa. En la
 *  BAHIA (`bahia`) alcanza con que no sea tierra: en el DEM la Bahia San Carlos es un canal bajo. */
function aguaCerca(x, z, largo, rot, bahia, max = 2500) {
  const fx = Math.sin(rot) * largo * 0.5, fz = -Math.cos(rot) * largo * 0.5, centro = bahia ? -0.5 : -6, punta = bahia ? 0 : -2;
  for (let r = 0; r <= max; r += bahia ? 25 : 60) {
    const n = r ? Math.max(8, Math.round(r / 20)) : 1;
    for (let k = 0; k < n; k++) {
      const a = k / n * 6.283, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
      if (hondo(px, pz) < centro && hondo(px + fx, pz + fz) < punta && hondo(px - fx, pz - fz) < punta) return [px, pz];
    }
  }
  return null;
}

/** Arma el teatro una vez (con el mundo cargado y el origen puesto). */
export function armar() {
  if (T.armado || !mundo.listo()) return;
  T.armado = true; semilla = 1982;
  for (const b of BASES) {
    const [cx, cz] = mundo.lonLatLocal(b.lon, b.lat);
    const base = { n: b.n, bando: b.bando, x: cx, z: cz, visto: b.bando === 'arg' };
    const grupos = [];   // (los soldados van despues de las piezas: su tarea depende de lo que hay en la base)
    for (const [tipo, n] of Object.entries(b.piezas)) {
      for (let i = 0; i < n; i++) {
        const a = rnd() * 6.283, d = b.r * (0.25 + 0.75 * Math.sqrt(rnd()));
        if (tipo === 'soldados') { grupos.push([cx + Math.cos(a) * d, cz + Math.sin(a) * d]); continue; }
        const H = HUELLA[tipo] || { r: 6, h: 4, hp: 2 };
        const p = tierraCerca(cx + Math.cos(a) * d, cz + Math.sin(a) * d, H.r);
        if (!p) continue;
        T.piezas.push({ tipo, malla: mallaDe(tipo), x: p[0], z: p[1], g: p[2], rot: rnd() * 6.283, bando: b.bando, base,
          r: H.r, h: H.h, hp: H.hp, vivo: true, cd: 2 + rnd() * ARMA_CD(tipo) });
      }
    }
    // LOS SOLDADOS (systems/islas/soldados.js): cada grupo con su tarea —ronda, trota, carga, guardia—
    for (const [x, z] of grupos) soldados.crear(T.soldados, { base, x, z, r: b.r, bando: b.bando, piezas: T.piezas, rnd, tierra: tierraCerca });
    // LAS TRINCHERAS de los nuestros (soldados.js `trinchera`): en el borde de la base, mirando afuera
    if (b.bando === 'arg') {
      const n = 2 + Math.floor(b.r / 160);
      for (let i = 0; i < n; i++) {
        const a = i / n * 6.283 + rnd() * 0.8, d = b.r * (0.75 + 0.35 * rnd());
        soldados.trinchera(T.soldados, T.trincheras, { base, x: cx + Math.cos(a) * d, z: cz + Math.sin(a) * d, cx, cz, rnd, tierra: tierraCerca });
      }
    }
    // LA BANDERA de la base (21/11, el autor: "que haya banderas tanto argentinas como britanicas en las bases")
    // (y las nuestras, ademas, en los costados de la base: 21/11, "banderas argentinas en los otros lados")
    for (let i = 0, nb = b.bando === 'arg' ? 3 : 1; i < nb; i++) {
      const a = rnd() * 6.283, d = i ? b.r * 0.7 : 0, p = tierraCerca(cx + Math.cos(a) * d, cz + Math.sin(a) * d, 4, 300);
      if (p) T.banderas.push({ x: p[0], z: p[1], g: p[2], bando: b.bando, fase: rnd() * 6.283 });
    }
    T.bases = T.bases || []; T.bases.push(base);
  }
  for (const s of BUQUES) {
    const esc = s.esc || 1, [x0, z0] = mundo.lonLatLocal(s.lon, s.lat), largo = (s.malla === 't21' ? 117 : 125) * esc, rot = s.rumbo * Math.PI / 180;
    const p = aguaCerca(x0, z0, largo, rot, !!s.bahia);
    if (!p) continue;
    // CON VIDA (100) Y SIN IDENTIFICADOR: el nombre solo sale en el cartel de LE DISTE A (data/islas_teatro.js BUQUES)
    const b = { n: s.n, malla: s.malla, clase: s.clase || s.malla, def: s.def || null, esc, bando: s.bando || 'gb',
      x: p[0], z: p[1], x0: p[0], z0: p[1], rot, largo, manga: 14 * Math.max(0.45, esc), h: 22 * Math.max(0.35, Math.min(1.3, esc)), vida: 100, vivo: true,
      patrulla: s.patrulla || 0, fase: rnd() * 6.283, cd: { largo: 2 + rnd() * 5, medio: 2 + rnd() * 4, corto: 1 + rnd() * 2 }, visto: false,
      hund: 0, humoT: 0, golpeT: -99 };
    T.buques.push(b);
    // SU PABELLON (la bandera la llevaban: en todas las dificultades), a popa
    T.banderas.push({ b, x: b.x, z: b.z, g: 0, bando: b.bando, fase: rnd() * 6.283 });
  }
  for (const r of RADARES) {
    if (r.buque) { const b = T.buques.find(q => q.n === r.buque); if (b) T.radares.push({ ...r, b }); continue; }
    const [x, z] = mundo.lonLatLocal(r.lon, r.lat);
    T.radares.push({ ...r, x, z });
  }
  for (const c of PAC) {
    const [x, z] = mundo.lonLatLocal(c.lon, c.lat);
    T.pac.push({ n: c.n, x, z, r: c.r, alt: c.alt, forma: c.forma, s: rnd() * 6.283, quedan: 2, estado: 'orbita', t: 0, cay: 0, bajados: 0, aviones: [{}, {}] });
  }
}
const ARMA_CD = tipo => (ARMAS[tipo] ? ARMAS[tipo].cada : 3);

/** Donde va una PAC sobre su recorrido `s` (rad): circulo, u ocho (la lemniscata de Gerono, que tiene la misma
 *  vuelta); devuelve posicion y rumbo. */
function enRecorrido(c, s) {
  const p = c.forma === 'ocho' ? [c.r * Math.sin(s), c.r * Math.sin(s) * Math.cos(s)] : [c.r * Math.cos(s), c.r * Math.sin(s)];
  const s2 = s + 0.01, q = c.forma === 'ocho' ? [c.r * Math.sin(s2), c.r * Math.sin(s2) * Math.cos(s2)] : [c.r * Math.cos(s2), c.r * Math.sin(s2)];
  return { x: c.x + p[0], z: c.z + p[1], yaw: Math.atan2(q[0] - p[0], -(q[1] - p[1])) };
}

/** UN CUADRO. `P` = el avion en el mapa ({ x, z, g, yaw, y }: y = su altura sobre el suelo), `pz` = a cuanto va
 *  delante de la camara en el carril, `boom(x, y, z, esc, tipo)` = la explosion 3D (islas.js `estallido`). */
export function paso(dt, P, pz, boom, jugando) {
  if (!T.armado) return;
  T.t += dt;
  const sy = Math.sin(P.yaw), cy = Math.cos(P.yaw), alto = P.g + P.y;
  // el punto del CARRIL donde cae algo del mapa (la cuenta de islas.js `aMundo`, al reves): d adelante, l de costado
  const carril = (x, z) => { const dx = x - P.x, dz = z - P.z; return { d: sy * dx - cy * dz, l: cy * dx + sy * dz, dist: Math.hypot(dx, dz) }; };
  // (con EL SONIDO DEL PASILLO de cada arma: systems/collision.js — el Rapier, el misil al hombro, el puesto, el buque)
  // `tipo`: 'traza' (cañon, ametralladora, fusil), 'misil' (el generico), 'dart' (SEA DART), 'cat' / 'wolf' (SEA CAT /
  // SEA WOLF, guiados: systems/collision.js); `i` corre en abanico las rafagas de varios
  const tira = (x, z, y, tipo, tiro, sonido, i = 0) => {
    const c = carril(x, z);
    if (c.d < pz + 40 || Math.abs(c.l) > c.d * 0.8) return false;   // atras o de costado
    // LEJOS: la trazadora no llega; el MISIL entra al carril desde `tiro` adelante, en la linea del que lo tiro (como si
    // ya viniera volando: el pasillo no tiene donde poner algo a 9 km)
    if (c.d > tiro) { if (tipo === 'traza') return false; c.l *= tiro / c.d; c.d = tiro; }
    const m = { x: c.l + i * 9 * (i % 2 ? 1 : -1), y: Math.max(1, y - P.g), z: c.d + pz + i * 8, done: false, tracer: tipo === 'traza', teatro: true };
    if (tipo === 'dart') m.tipo = 'dart';
    else if (tipo === 'cat' || tipo === 'wolf') { m.tipo = 'wolf'; m.def = tipo; m.vx = 0; m.vy = 0; }
    missiles.push(m);
    if (sonido === 'manpad') beep(520, 0.12, 'sawtooth', 0.04, 900);
    else if (sonido === 'buque') sfxOne('lanzaMisil');
    else if (tipo === 'traza') beep(300, 0.05, 'square', 0.04);
    else beep(760, 0.1, 'square', 0.05);
    return true;
  };
  // (sonda: lo britanico mas cercano, en el carril)
  { let m = null; for (const o of [...T.piezas, ...T.buques]) { if (!o.vivo || (o.bando && o.bando !== 'gb')) continue; const c = carril(o.x, o.z); if (!m || c.dist < m.dist) m = { ...c, n: o.n || o.tipo }; } T.cerca = m; }
  // ---- LOS ANTIAEREOS BRITANICOS ----
  for (const e of T.piezas) {
    if (!e.vivo || e.bando !== 'gb') continue;
    const A = ARMAS[e.tipo];
    if (!A) continue;
    e.cd -= dt;
    if (e.cd > 0 || !jugando) continue;
    const dist = Math.hypot(e.x - P.x, e.z - P.z, e.g - alto);
    if (dist > A.alcance) { e.cd = 0.5; continue; }
    e.base.visto = true;
    e.cd = tira(e.x, e.z, e.g + 3, A.tipo, A.tiro, e.tipo) ? A.cada * (0.8 + rnd() * 0.4) : 0.3;
  }
  // ---- LOS BUQUES: los de piquete van y vienen; cada uno tira con lo suyo segun a que distancia estes ----
  // EL FUEGO DEL BUQUE DE CERCA, COMO EN EL PASILLO (21/11, el autor: "en las islas tiene que funcionar igual, tanto
  // visual como sonido"): adentro del alcance del arma corta de un buque britanico vivo, las balas caen al agua alrededor
  // tuyo (salpicones chicos adelante y a los costados) y cada tanto una COLUMNA del cañon grande camina sobre tu rumbo.
  // El sonido (las balas pasando, la chapa, el agua) lo pone audio.js con `fuegoCerca()`
  T.fuego = false;
  T.salpT = (T.salpT ?? 0) - dt; T.columnaT = (T.columnaT ?? 2) - dt; T.fuegoT = (T.fuegoT ?? 0) - dt;
  // (solo mientras un buque TIRA de verdad con su arma corta — `fuegoT`, lo carga el disparo, abajo)
  if (jugando && T.fuegoT > 0) for (const b of T.buques) {
    if (!b.vivo || b.bando !== 'gb') continue;
    const D = DEFENSA[b.clase] || DEFENSA.log, A = D.corto;
    if (!A || Math.hypot(b.x - P.x, b.z - P.z) > A.alcance) continue;
    T.fuego = true;
    const enAgua = (x, z) => mundo.sueloH(x, z) <= 0.3;
    if (T.salpT <= 0) {
      T.salpT = 0.18 + rnd() * 0.35;
      const d = 60 + rnd() * 260, l = (rnd() - 0.5) * 90, x = P.x + sy * d + cy * l, z = P.z - cy * d + sy * l;
      if (enAgua(x, z)) { boom(x, 0, z, 0.35 + rnd() * 0.3, 'agua'); salpicon(1 - Math.min(1, (d + Math.abs(l)) / 350)); }
    }
    if (T.columnaT <= 0) {
      T.columnaT = 2.2 + rnd() * 1.6;
      // la columna cae SOBRE tu rumbo, un poco adelante: castiga volar derecho, como el 4,5" del pasillo
      const d = 140 + rnd() * 200, l = (rnd() - 0.5) * 30, x = P.x + sy * d + cy * l, z = P.z - cy * d + sy * l;
      if (enAgua(x, z)) { boom(x, 0, z, 1.6, 'agua'); sfxOne('aguaColumna', 0.8 + rnd() * 0.2); }
    }
    break;
  }
  for (const b of T.buques) {
    // EL QUE SE HUNDE: escora y baja de a poco (teatro3d.js lo dibuja con `hund`); su bandera con el
    if (!b.vivo) { b.hund = Math.min(b.h * 1.1, b.hund + dt * 0.5); continue; }
    if (b.patrulla) {
      b.fase += dt * 7 / b.patrulla;   // ~7 m/s
      const k = Math.sin(b.fase) * b.patrulla * 0.5, rumbo = b.rot0 === undefined ? (b.rot0 = b.rot) : b.rot0;
      b.x = b.x0 + Math.sin(rumbo) * k; b.z = b.z0 - Math.cos(rumbo) * k;
      b.rot = rumbo + (Math.cos(b.fase) < 0 ? Math.PI : 0);
    }
    const dist = Math.hypot(b.x - P.x, b.z - P.z);
    if (dist < 6000) b.visto = true;
    // EL DAÑADO HUMEA (cada tanto, desde algun lugar del casco)
    if (b.vida < 75) {
      b.humoT -= dt;
      if (b.humoT <= 0) { b.humoT = 1.2 + rnd() * 1.2; const k = (rnd() - 0.5) * b.largo * 0.6; boom(b.x + Math.sin(b.rot) * k, b.h * 0.5, b.z - Math.cos(b.rot) * k, 0.5 + (75 - b.vida) / 100, 'humea'); }
    }
    if (!jugando || b.bando !== 'gb') continue;
    // LAS TRES BANDAS (data/islas_teatro.js DEFENSA): largo, medio y corto, cada una con su arma y su cadencia; DAÑADO
    // TIRA MENOS. EL MURO del portaaviones: adentro de `muro`, rafagas de Sea Dart una tras otra
    const D = DEFENSA[b.clase] || DEFENSA.log, k = DANADO_MIN + (1 - DANADO_MIN) * b.vida / 100, muro = D.muro && dist < D.muro;
    for (const banda of ['largo', 'medio', 'corto']) {
      const A = D[banda];
      if (!A) continue;
      b.cd[banda] -= dt;
      if (b.cd[banda] > 0) continue;
      if (dist > A.alcance) { b.cd[banda] = 0.5; continue; }
      const arma = banda === 'medio' && b.def ? b.def : A.arma, n = muro && banda === 'largo' ? 3 : A.n || 1;
      let ok = false;
      for (let i = 0; i < n; i++) ok = tira(b.x, b.z, banda === 'corto' ? 10 : 14, arma, A.tiro, banda === 'corto' ? null : 'buque', i) || ok;
      if (ok && banda === 'corto') T.fuegoT = 1.4;   // la rafaga corta: su agua alrededor tuyo dura lo que tardan en llegar
      b.cd[banda] = !ok ? 0.3 : muro && banda === 'largo' ? 0.8 : A.cada * (0.8 + rnd() * 0.4) / k;
    }
  }
  // LAS BANDERAS DE LOS BUQUES van con el buque, a popa (y se hunden con el)
  for (const f of T.banderas) {
    const b = f.b;
    if (!b) continue;
    f.x = b.x - Math.sin(b.rot) * b.largo * 0.38; f.z = b.z + Math.cos(b.rot) * b.largo * 0.38; f.g = b.h * 0.45 - b.hund;
  }
  // ---- LAS ZONAS DE RADAR: en cual estas y si te ven ----
  const Z = { gb: null, arg: null, visto: false };
  for (const r of T.radares) {
    const q = posRadar(r);
    if (q && Math.hypot(q.x - P.x, q.z - P.z) < r.r) Z[r.bando] = Z[r.bando] || r.n;
  }
  Z.visto = !!Z.gb && P.y > RADAR_BAJO && jugando;
  if (Z.gb !== T.zona.gb && Z.gb) T.eventos.push({ k: 'zona_gb', n: Z.gb });
  if (Z.arg !== T.zona.arg && Z.arg) T.eventos.push({ k: 'zona_arg', n: Z.arg });
  // LA RED SOBRE EL TERRENO (21/11, el autor: "los radares solo se marcan como una malla sobre el terreno si el avion
  // vuela SOBRE el radar"): la del radar que tenes a menos de RED_SOBRE; y la nuestra, ademas, al entrar a su zona
  // (el cartel ZONA DE RADAR ARGENTINO y 2 s mas: despues queda solo la placa azul del tablero)
  Z.argT = Z.arg ? (Z.arg === T.zona.arg ? (T.zona.argT || 0) + dt : 0) : 99;
  Z.red = null;
  for (const r of T.radares) {
    const q = posRadar(r);
    if (q && Math.hypot(q.x - P.x, q.z - P.z) < RED_SOBRE) { Z.red = r.n; break; }
  }
  if (!Z.red && Z.arg && Z.argT < RED_ARG_T) Z.red = Z.arg;
  T.zona = Z;
  // TU VELOCIDAD sobre el mapa (suavizada): la PAC que viene tiene que poder alcanzarte
  // (un salto —la sonda, el mapa— no es velocidad: pasado de 600 m/s se ignora)
  { const v = T.px !== undefined && dt > 0 ? Math.hypot(P.x - T.px, P.z - T.pz) / dt : -1;
    if (v >= 0 && v < 600) T.vel = (T.vel || 200) + (v - (T.vel || 200)) * Math.min(1, dt * 2); }
  T.px = P.x; T.pz = P.z;
  T.vistoT = Z.visto ? 0 : T.vistoT + dt;
  if (Z.visto) T.ultimo = { x: P.x, z: P.z };
  // EN LA NUESTRA no entran: los que te perseguian se van (una vez por entrada)
  if (Z.arg && harriers.activo() && !T.retiro) { harriers.retirar(); T.retiro = true; T.eventos.push({ k: 'se_van' }); }
  if (!Z.arg) T.retiro = false;
  const radarArg = T.radares.find(r => r.bando === 'arg');
  // ---- LAS PAC ----
  // LOS QUE ESTAN EN EL AIRE (harriers.js): vuelan, tiran, caen
  for (const e of harriers.paso(dt, P, pz, boom, jugando)) if (e.k === 'bajado') T.eventos.push({ k: 'bajado' });
  const yaVienen = T.pac.some(c => c.estado === 'vector');
  let llamada = null;   // la PAC que el radar britanico manda a buscarte (la mas cercana, de a una)
  if (Z.visto && !yaVienen && !harriers.activo()) {
    let bd = PAC_VECTOR;
    for (const c of T.pac) { if (c.estado !== 'orbita' || !c.quedan) continue; const d = Math.hypot(c.x - P.x, c.z - P.z); if (d < bd) { bd = d; llamada = c; } }
  }
  for (const c of T.pac) {
    if (c.estado === 'muerta') continue;
    // NUESTRO RADAR LAS VE: las que estan en su alcance quedan en el mapa
    if (radarArg && Math.hypot(c.x - radarArg.x, c.z - radarArg.z) < radarArg.r) c.vista = true;
    const engancha = (x, z) => {
      if (!jugando || harriers.activo() || Z.arg || Math.hypot(x - P.x, z - P.z) >= PAC_VE) return false;
      // TE VIO: la pareja rompe y te salta encima, como aviones (harriers.js)
      c.estado = 'caza';
      harriers.soltar(c, c.aviones, c.quedan);
      T.eventos.push({ k: 'encima' });
      return true;
    };
    if (c === llamada) {
      // EL RADAR TE VIO: la pareja sale de su circulo hacia vos
      const a = c.aviones[0] && c.aviones[0].x !== undefined ? c.aviones[0] : enRecorrido(c, c.s);
      c.estado = 'vector'; c.vx = a.x; c.vz = a.z; c.vy = c.alt;
      T.eventos.push({ k: 'vienen', n: c.n, d: Math.hypot(c.vx - P.x, c.vz - P.z), avisa: !!Z.arg || (radarArg && Math.hypot(c.vx - radarArg.x, c.vz - radarArg.z) < radarArg.r) });
    }
    if (c.estado === 'vector') {
      // hacia vos (o hacia donde el radar te vio por ultima vez); si te perdio hace rato, de vuelta al circulo
      const vuelve = T.vistoT > PAC_OLVIDA || Z.arg;
      const meta = vuelve ? enRecorrido(c, c.s) : (Z.visto ? P : T.ultimo || P);
      const dx = meta.x - c.vx, dz = meta.z - c.vz, d = Math.hypot(dx, dz), paso = Math.min(d, Math.max(PAC_VEL_VECTOR, (T.vel || 200) * 1.7) * dt);
      if (d > 1) { c.vx += dx / d * paso; c.vz += dz / d * paso; }
      const yaw = Math.atan2(dx, -dz), alt = vuelve ? c.alt : Math.max(120, P.g + P.y + 80);
      c.vy += (alt - c.vy) * Math.min(1, dt * 0.5);
      c.aviones[0] = { x: c.vx, z: c.vz, y: c.vy, yaw };
      c.aviones[1] = { x: c.vx - Math.sin(yaw) * 220 + Math.cos(yaw) * 90, z: c.vz + Math.cos(yaw) * 220 + Math.sin(yaw) * 90, y: c.vy + 20, yaw };
      c.aviones.length = c.quedan;
      if (vuelve && d < 300) c.estado = 'orbita';
      else if (!vuelve) engancha(c.vx, c.vz);
      continue;
    }
    if (c.estado === 'orbita') {
      c.s += dt * 150 / c.r;   // ~150 m/s sobre el recorrido
      if (Math.hypot(c.x - P.x, c.z - P.z) < c.r + 6000) c.vista = true;   // (el mapa de la pausa la marca)
      const a = enRecorrido(c, c.s), b = enRecorrido(c, c.s - 260 / c.r);
      c.aviones[0] = { x: a.x, z: a.z, y: c.alt, yaw: a.yaw };
      c.aviones[1] = { x: b.x + Math.cos(b.yaw) * 60, z: b.z + Math.sin(b.yaw) * 60, y: c.alt + 20, yaw: b.yaw };
      c.aviones.length = c.quedan;
      engancha(a.x, a.z);   // (te vio a ojo: rompe el circulo y te toma la cola)
    } else if (c.estado === 'caza') {
      // cuando no queda ninguno en el aire: los que volvieron retoman el circulo; si los bajaste a todos, se acabo
      const e = harriers.estadoDe(c);
      if (!e.vivos && !e.cayendo) {
        c.quedan = Math.max(0, c.quedan - e.bajados);
        c.estado = c.quedan ? 'orbita' : 'muerta'; c.t = 0;
      }
    } else if (c.estado === 'fuera') {
      c.t += dt;
      if (c.t > PAC_VUELVE) c.estado = 'orbita';
    }
  }
  // ---- LAS BASES que pasaste cerca quedan en el mapa ----
  for (const b of T.bases || []) if (!b.visto && Math.hypot(b.x - P.x, b.z - P.z) < 4500) b.visto = true;
  // ---- LOS SOLDADOS: su tarea, y se cubren si pasas bajo ----
  soldados.paso(T.soldados, dt, P, rnd); T.ultP = P;
  // ---- LOS QUE TIRAN DESDE TIERRA: los soldados britanicos cerca y abajo (data/islas_teatro.js FUSILES) ----
  if (jugando) {
    T.fusilT = (T.fusilT || 0) - dt;
    if (T.fusilT <= 0) {
      T.fusilT = FUSILES.cada / FUSILES.max * (0.7 + rnd() * 0.6);
      const cerca = T.soldados.filter(q => q.vivo && q.bando === 'gb' && alto - q.g < FUSILES.techo && Math.hypot(q.x - P.x, q.z - P.z) < FUSILES.alcance);
      if (cerca.length) {
        cerca.sort((a, b) => Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z));
        const q = cerca[(rnd() * Math.min(cerca.length, FUSILES.max)) | 0];
        tira(q.x, q.z, q.g + 1.5, 'traza', FUSILES.tiro);
      }
    }
  }
  // ---- TUS BALAS sobre el mapa (islas.js las ancla: `__islasB`) ----
  for (const bl of bullets) {
    const q = bl.__islasB;
    if (!q || bl.done) continue;
    const by = P.g + (bl.y || 0);
    for (const e of T.piezas) {
      if (!e.vivo || Math.abs(q.x - e.x) > e.r || Math.abs(q.z - e.z) > e.r || by > e.g + e.h + 2) continue;
      bl.done = true; golpe(e, 1, boom); if (rnd() < 0.5) boom(q.x, by, q.z, 0.5, 'astillas', q.dx * 40, q.dz * 40); break;
    }
    if (bl.done) continue;
    // (la rafaga contra la gente: el que toca cae, los de cerca corren)
    if (by < P.g + 60 && soldados.bala(T.soldados, q.x, q.z, by, rnd)) { bl.done = true; continue; }
    for (const b of T.buques) {
      if (!b.vivo || by > b.h + 4) continue;
      if (enCasco(b, q.x, q.z)) { bl.done = true; balaBuque(b, q.x, by, q.z, boom); break; }
    }
  }
  // ---- TUS BOMBAS contra los buques (las de tierra las resuelve `impacto`) ----
  for (let i = pmissiles.length - 1; i >= 0; i--) {
    const pm = pmissiles[i], q = posBomba(pm);
    if (!q) continue;
    for (const b of T.buques) {
      if (!b.vivo || q.alto > b.h || !enCasco(b, q.x, q.z)) continue;
      pmissiles.splice(i, 1); bombaBuque(b, q, boom); break;
    }
  }
}
/** EL AVION CONTRA LO QUE HAY EN EL MAPA (21/11): una pieza de pie (su radio y su alto) o el casco de un buque.
 *  Devuelve la causa de muerte, o null. (Lo derribado ya no estorba: queda aplastado.) */
export function choca(x, z, alto) {
  if (!T.armado) return null;
  for (const e of T.piezas) if (e.vivo && Math.hypot(x - e.x, z - e.z) < e.r * 0.8 && alto < e.g + e.h) return e.tipo === 'canon' || e.tipo === 'rapier' || e.tipo === 'manpad' ? 'death_aagun' : 'death_bldg';
  for (const b of T.buques) if (b.vivo && alto < b.h && enCasco(b, x, z)) return 'death_ship';
  return null;
}
/** Donde esta un radar (el de un buque va con el; si lo hundiste, no hay radar). */
function posRadar(r) {
  if (r.b) return r.b.vivo ? r.b : null;
  return r;
}
/** La zona en la que estas ({ gb, arg: nombre del radar o null; visto: si el britanico te ve }) y lo que paso
 *  desde el ultimo cuadro (islas.js lo vuelve carteles). */
export const zona = () => T.zona;
export const tomarEventos = () => T.eventos.splice(0);
/** Los radares, para el mapa de la pausa: { n, bando, x, z, r } (los de un buque hundido no estan). */
export const radares = () => T.radares.map(r => { const q = posRadar(r); return q ? { n: r.n, bando: r.bando, x: q.x, z: q.z, r: r.r } : null; }).filter(Boolean);

function enCasco(b, x, z) {
  const ex = x - b.x, ez = z - b.z, c = Math.cos(b.rot), s = Math.sin(b.rot);
  const lado = ex * c + ez * s, largo = -ex * s + ez * c;
  return Math.abs(lado) < b.manga * 0.6 && Math.abs(largo) < b.largo * 0.5;
}
function golpe(e, n, boom, y) {
  // (FUEGO AMIGO: le pegaste a algo nuestro — el cartel lo dice despues, nunca antes; una vez cada tanto por base)
  if (e.bando === 'arg' && e.base && T.t - (e.base.amigoT ?? -99) > 8) { e.base.amigoT = T.t; T.eventos.push({ k: 'fuego_amigo', n: e.base.n }); }
  e.hp -= n;
  if (e.hp > 0) { boom(e.x, (y !== undefined ? y : (e.g || 0) + 2), e.z, 0.35, 'fuego'); return; }
  e.vivo = false;
  const grande = e.largo ? 2.4 : e.tipo === 'deposito' || e.tipo === 'herc' ? 1.6 : 1;
  boom(e.x, (e.g || 0) + (e.h || 4) * 0.4, e.z, grande, 'fuego');
}

/** LA BALA DE CAÑON contra un casco: un rasguño (BOMBA.BALA), chispas, y el cartel una vez cada tanto. */
function balaBuque(b, x, y, z, boom) {
  b.vida = Math.max(BOMBA.PISO, b.vida - BOMBA.BALA);
  if (rnd() < 0.4) boom(x, Math.max(1, y), z, 0.5, 'chispas');
  if (T.t - b.golpeT > 5) { b.golpeT = T.t; T.eventos.push({ k: 'le_diste', n: b.n, bando: b.bando, res: 'balas', vida: b.vida }); }
}
/** LA BOMBA contra un casco (data/islas_teatro.js BOMBA): ¿pega?, ¿detona?, ¿perfora?, ¿atraviesa o queda adentro?,
 *  y el daño segun la ZONA (las maquinas, el resto del casco, las puntas). Solo la detonacion lo hunde. */
function bombaBuque(b, q, boom) {
  const B = BOMBA, ev = { k: 'le_diste', n: b.n, bando: b.bando };
  if (rnd() > B.PEGA) { boom(q.x, 0, q.z, 0.9, 'agua'); ev.res = 'cerca'; T.eventos.push(ev); return; }   // al agua, pegada al casco
  b.golpeT = T.t;
  const ex = q.x - b.x, ez = q.z - b.z;
  const u = Math.min(1, Math.abs(ex * Math.sin(b.rot) - ez * Math.cos(b.rot)) / (b.largo / 2));
  const zona = u < 0.3 ? 'maquinas' : u < 0.75 ? 'casco' : 'punta';
  ev.zona = zona;
  if (rnd() < B.DETONA) {
    ev.res = 'detona'; boom(q.x, Math.max(2, q.alto), q.z, 2.6 * Math.max(0.6, b.esc), 'detona'); hundir(b);
  } else if (rnd() < (zona === 'punta' ? B.PERFORA_PUNTA : B.PERFORA)) {
    const atraviesa = rnd() < B.ATRAVIESA, [a0, a1] = B.DANO[zona];
    let d = a0 + rnd() * (a1 - a0);
    if (atraviesa) d = Math.max(30, d * B.DANO_ATRAVIESA);
    b.vida = Math.max(B.PISO, b.vida - d);
    ev.res = atraviesa ? 'atraviesa' : 'queda'; ev.dano = Math.round(d);
    boom(q.x, Math.max(2, q.alto), q.z, 1.1 * Math.max(0.6, b.esc), 'perfora');
    // (la que atraviesa sale por el otro lado y cae al agua: la columna, del otro costado)
    if (atraviesa) boom(q.x + Math.cos(b.rot) * b.manga, 0, q.z + Math.sin(b.rot) * b.manga, 0.7, 'agua');
  } else {
    const d = B.DANO_REBOTA[0] + rnd() * (B.DANO_REBOTA[1] - B.DANO_REBOTA[0]);
    b.vida = Math.max(B.PISO, b.vida - d);
    ev.res = 'rebota'; ev.dano = Math.round(d); boom(q.x, Math.max(2, q.alto), q.z, 1, 'chispas');
  }
  ev.vida = Math.round(b.vida);
  T.eventos.push(ev);
}
function hundir(b) {
  if (!b.vivo) return;
  b.vida = 0; b.vivo = false;
  T.eventos.push({ k: 'hundido', n: b.n, bando: b.bando });
}
/** EL EXOCET que llego (game.js, al cerrar EL PULSO desde las islas): al buque britanico mas cercano a (x, z) dentro de
 *  `r` m. Detona mas seguido que una bomba (`detona`) y si no, le saca 45-65. Devuelve su nombre o null. */
export function exocet(x, z, r = 60000, detona = 0.35) {
  let b = null, bd = r;
  for (const q of T.buques) { if (!q.vivo || q.bando !== 'gb') continue; const d = Math.hypot(q.x - x, q.z - z); if (d < bd) { bd = d; b = q; } }
  if (!b) return null;
  b.golpeT = T.t;
  const ev = { k: 'le_diste', n: b.n, bando: b.bando, res: 'exocet' };
  if (rnd() < detona) { ev.res = 'exocet_hunde'; hundir(b); }
  else b.vida = Math.max(BOMBA.PISO, b.vida - (45 + rnd() * 20));
  ev.vida = Math.round(b.vida);
  T.eventos.push(ev);
  return b.n;
}
/** LOS PORTAAVIONES (para el Exocet): los vivos, con su punto. */
export const portaaviones = () => T.buques.filter(b => b.clase === 'cv' && b.vivo).map(b => ({ n: b.n, x: b.x, z: b.z }));

/** Una bomba que pego en tierra (islas.js `bombas`): rompe lo que haya en el radio. */
export function impacto(x, z, boom) {
  for (const e of T.piezas) if (e.vivo && Math.hypot(e.x - x, e.z - z) < e.r + 22) golpe(e, 3, boom);
  soldados.bomba(T.soldados, x, z, 25, rnd);
}

/** Lo que dibuja teatro3d.js (y el mapa de la pausa). */
export function escena() {
  if (!T.armado) return null;
  return { piezas: T.piezas, buques: T.buques, pac: T.pac, soldados: T.soldados, trincheras: T.trincheras, banderas: T.banderas, t: T.t };
}
export const bases = () => (T.armado ? T.bases || [] : []);

// SONDA (consola y PRUEBAS): cuanto se armo y lo mas cercano a (x, z)
if (typeof window !== 'undefined') window.__teatroIslas = () => JSON.stringify({ armado: T.armado, piezas: T.piezas.length, buques: T.buques.length,
  pac: T.pac.map(c => c.estado + ':' + c.quedan), soldados: T.soldados.length,
  soldCerca: T.ultP && T.soldados.length ? Math.min(...T.soldados.map(s => Math.hypot(s.x - T.ultP.x, s.z - T.ultP.z))) | 0 : null, alto: T.ultP && (T.ultP.g + T.ultP.y) | 0,
  sold: T.soldados.reduce((o, s) => { const k = (s.vivo ? s.est : 'muerto') + '/' + s.tarea; o[k] = (o[k] || 0) + 1; return o; }, {}),
  conGrupo: T.piezas.filter(e => e.__g).length, visibles: T.piezas.filter(e => e.__g && e.__g.visible).length,
  buqueGrupo: T.buques.filter(e => e.__g).length, cerca: T.cerca && [T.cerca.n, T.cerca.d | 0, T.cerca.l | 0, T.cerca.dist | 0],
  ej: T.piezas.slice(0, 2).map(e => [e.tipo, e.x | 0, e.z | 0, e.g | 0]), bq: T.buques.map(e => [e.n, e.x | 0, e.z | 0, !!e.__g, e.__g ? e.__g.visible : null]) });
// SONDA de los soldados (21/11): donde estan los de una tarea, para ir a mirarlos; y lon/lat → mapa
if (typeof window !== 'undefined') {
  window.__soldados = tarea => JSON.stringify(T.soldados.filter(s => !tarea || s.tarea === tarea).slice(0, 6).map(s => [s.x | 0, s.z | 0, s.g | 0, s.est, s.tarea, s.bando, s.caja]));
  window.__lonLatLocal = (lon, lat) => mundo.lonLatLocal(lon, lat);
}
// SONDA (21/11): `__bombaBuque(nombre, n)` le tira n bombas al centro del buque y cuenta como salieron (sin dibujo);
// `__buques()` la vida de cada uno
if (typeof window !== 'undefined') {
  window.__bombaBuque = (n, k = 1, cuenta = false, repone = false) => {
    const b = T.buques.find(q => q.n === n);
    if (!b) return null;
    if (repone) { b.vida = 100; b.vivo = true; b.hund = 0; }
    const r = {};
    for (let i = 0; i < k && b.vivo; i++) {
      const u = (Math.random() - 0.5) * 0.9 * b.largo;
      bombaBuque(b, { x: b.x + Math.sin(b.rot) * u, z: b.z - Math.cos(b.rot) * u, alto: b.h * 0.5 }, () => {});
      const e = T.eventos[T.eventos.length - 1]; r[e.res] = (r[e.res] || 0) + 1;
      if (cuenta) T.eventos.length = 0;
    }
    return JSON.stringify({ r, vida: Math.round(b.vida), vivo: b.vivo });
  };
  window.__misilesTipos = () => missiles.filter(m => m.teatro && !m.done).reduce((o, m) => { const k = m.tracer ? 'traza' : m.tipo === 'wolf' ? m.def : m.tipo || 'misil'; o[k] = (o[k] || 0) + 1; return o; }, {});
  window.__buques = () => JSON.stringify(T.buques.map(b => [b.n, b.bando, b.clase, Math.round(b.vida), b.vivo, b.x | 0, b.z | 0]));
}
