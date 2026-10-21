// LA DEFENSA CERCANA DEL BUQUE — Sea Cat o Sea Wolf (data/defensas.js). Nacio como el del Sea Wolf
// (28/9) y los dos comparten el sistema: cambian los numeros y el dibujo.
//
// Un ciclo simple por LANZADOR, mientras el avion esta ADENTRO de su zona (el `alcance` de su defensa):
//   'fija'     el radar o el operador te engancha: `fija` segundos de aviso (la linea del buque al
//              avion, la placa titilando)
//   'salva'    salen misiles, uno cada `cada`
//   'recarga'  SW_RECARGA segundos sin tirar: la ventana para entrar
// y vuelve a fijar. Fuera de la zona (lejos, o ya pasado el buque) no hace nada.
//
// DESDE LOS SISTEMAS DEL BUQUE (docs/sistemas/PLAN_DEFENSAS_BUQUE.md, F2, 20/10/2026). Si el buque
// trae su armamento real (data/armamento.js), la defensa SALE de el: tira cada lanzador VIVO o DAÑADO
// de su casco —y los de su ESCOLTA, de costado—, cada uno desde su lugar de la eslora, y lo que le
// pasa a cada pieza cambia como tira:
//   lanzador          tira su CARGADOR real (4 Sea Cat, 6 Sea Wolf) y recarga · DAÑADO: medio cargador y
//                     recarga doble · FUERA: no tira
//   director DAÑADO   Sea Cat: corrige mas perezoso y se queda ciego antes (gk/ck); Sea Wolf: el 910
//                     pierde el blanco a ratos (la debilidad historica) · FUERA: salen sin guia
// La escolta no se puede cañonear (es otro buque); su 910 se confunde con el ATAQUE COORDINADO
// (`run.defK` < 1: dos aviones cruzandose, que es como le fallo a la Brilliant contra ORO, 12/5).
// Un buque SIN entrada en data/armamento.js tira la defensa de respaldo de siempre (`poner`).
//
// El GUIADO de cada misil vive en systems/collision.js, con el resto de los misiles (tipo 'wolf').
// Aca solo se decide CUANDO y DESDE DONDE salen. El estado es del modulo y se reinicia con la
// corrida y con el buque; lo que ve el render sale por `snapshot()` (convencion 4: el dibujo lee).
import { missiles } from '../core/world.js';
import { run } from '../core/run.js';
import { blanco, cajaSistema } from '../core/blanco.js';
import { BL } from '../data/blanco.js';
import { SW_SALVA, SW_RECARGA, SW_ALTO } from '../data/tuning.js';
import { DEFENSAS } from '../data/defensas.js';
import { ESCOLTA } from '../data/sistemas_buque.js';

// LA DEFENSA DE RESPALDO DE ESTE BUQUE: 'cat' | 'wolf' | null (sin defensa cercana). La pone game.js
// al armar la corrida (`poner`), segun la mision. `null` apaga TODO (tambien lo que traen los sistemas:
// es como la carta que se lleva la defensa del blanco, o una estructura).
let tipo = null, D = null;
export function poner(t) { tipo = DEFENSAS[t] ? t : null; D = tipo ? DEFENSAS[tipo] : null; }

const FAM = { seacat_lanz: 'cat', seawolf_lanz: 'wolf' };
const DIR = { cat: 'seacat_dir', wolf: 'seawolf_910' };

let nId = 0;
// EL CICLO DE CADA LANZADOR, por pieza (la de respaldo usa la clave 'respaldo')
const ciclos = new Map();
const ciclo = k => { let c = ciclos.get(k); if (!c) { c = { fase: 'fuera', t: 0, salen: 0 }; ciclos.set(k, c); } return c; };
// EL HUMO DEL LANZAMIENTO (28/9): cada disparo deja una bocanada en la cubierta. Se guarda la EDAD
// (segundos, con el dt del mundo) y de donde salio; el render la dibuja. Vive mas alla de la zona:
// el humo no se apaga porque te fuiste.
const HUMO_VIDA = 1.8;
const humos = [];

/** Los LANZADORES de esta corrida: { k, fam, D, x, y, z, estado, dir, escolta }. Con armamento
 *  real, los de los sistemas (casco + escolta); sin armamento, el de respaldo desde el centro. */
function lanzadores() {
  if (!D) return [];
  const L = [];
  if (!blanco.sistemas.length) {
    L.push({ k: 'respaldo', fam: tipo, D, x: BL.X, y: SW_ALTO, z: blanco.z, estado: 'vivo', dir: 'vivo' });
    return L;
  }
  const mejorDir = (lista, fam) => {
    const ds = lista.filter(s => s.tipo === DIR[fam]);
    if (!ds.length) return 'vivo';
    return ds.some(s => s.estado === 'vivo') ? 'vivo' : ds.some(s => s.estado === 'danado') ? 'danado' : 'fuera';
  };
  for (const s of blanco.sistemas) {
    const fam = FAM[s.tipo];
    if (!fam || s.estado === 'fuera') continue;
    const c = cajaSistema(s);
    L.push({ k: s, fam, D: DEFENSAS[fam], x: c.x, y: c.y + c.hy, z: blanco.z, estado: s.estado, dir: mejorDir(blanco.sistemas, fam) });
  }
  const e = blanco.escolta;
  if (e) for (const s of e.sistemas) {
    const fam = FAM[s.tipo];
    if (!fam) continue;
    // la escolta va a un costado y un poco detras (ESCOLTA): sus misiles cruzan el pasillo de lado
    // su director: como lo dejo la mision (r2: el 910 de la Brilliant, confundido), y con el ATAQUE
    // COORDINADO un escalon peor (dos aviones cruzandose)
    let dir = mejorDir(e.sistemas, fam);
    if ((run.defK || 1) < 1 && dir === 'vivo') dir = 'danado';
    L.push({ k: s, fam, D: DEFENSAS[fam], x: BL.X + e.lado * ESCOLTA.X + (s.u - 0.5) * 6, y: SW_ALTO, z: blanco.z + ESCOLTA.DZ,
      estado: s.estado, dir, escolta: true });
  }
  return L;
}

const dentroDe = (l, pz) => blanco.on && !blanco.hundido && l.z > pz && l.z - pz < l.D.alcance;

/** ¿El avion (a profundidad `pz`) esta adentro de la zona de ALGUN lanzador? */
export const enZona = pz => lanzadores().some(l => dentroDe(l, pz));

/** Un cuadro. `e` = { activo, pz, plane }. `activo` lo resuelve el orquestador: pasillo jugable, sin
 *  el negro ni la camara lenta del final de la suelta. Devuelve la señal del cuadro para el sonido:
 *  'fija' (te engancho) | 'tira' (salio un misil) | null. */
export function step(dt, e) {
  for (const h of humos) h.edad += dt;
  while (humos.length && humos[0].edad > HUMO_VIDA) humos.shift();
  let señal = null;
  const vivos = new Set();
  for (const l of lanzadores()) {
    vivos.add(l.k);
    const c = ciclo(l.k);
    if (!e.activo || !dentroDe(l, e.pz)) { c.fase = 'fuera'; c.t = 0; c.salen = 0; continue; }
    // EL CARGADOR DEL LANZADOR REAL (data/defensas.js: 4 el Sea Cat, 6 el Sea Wolf) y su recarga — la
    // ventana para cañonearlo. El de respaldo tira continuo, como siempre. DAÑADO: la mitad y el doble.
    const real = l.k !== 'respaldo', mal = l.estado === 'danado';
    const salva = real ? Math.max(1, Math.round(l.D.cargador / (mal ? 2 : 1))) : SW_SALVA;
    const recarga = (real ? l.D.recarga : SW_RECARGA) * (mal ? 2 : 1);
    c.t += dt;
    if (c.fase === 'fuera') { c.fase = 'fija'; c.t = 0; señal = señal || 'fija'; continue; }
    if (c.fase === 'fija' && c.t >= l.D.fija) { c.fase = 'salva'; c.t = l.D.cada; c.salen = 0; }
    if (c.fase === 'salva' && c.t >= l.D.cada) {
      c.t = 0; c.salen++;
      // sale de SU lugar del casco, apenas corrido hacia el lado del avion
      const lado = Math.sign(e.plane.x - l.x || 1) * 2;
      const m = { tipo: 'wolf', def: l.fam, id: ++nId, x: l.x + lado, y: l.y, z: l.z, vx: 0, vy: 0, done: false };
      // EL DIRECTOR: lo que le pasa a la guia
      if (l.dir === 'fuera') m.sinGuia = true;
      else if (l.dir === 'danado') { if (l.fam === 'wolf') m.pierde = true; else { m.gk = 0.6; m.ck = 1.4; } }
      missiles.push(m);
      humos.push({ edad: 0, dx: l.x + lado - BL.X, dz: l.z - blanco.z, semilla: nId });
      if (c.salen >= salva) { c.fase = 'recarga'; c.t = 0; }
      señal = 'tira';
      continue;
    }
    if (c.fase === 'recarga' && c.t >= recarga) { c.fase = 'fija'; c.t = 0; señal = señal || 'fija'; }
  }
  // un lanzador que salio FUERA deja de tener ciclo
  for (const k of [...ciclos.keys()]) if (!vivos.has(k)) ciclos.delete(k);
  return señal;
}

/** ¿Hay misiles Sea Wolf viniendo hacia vos? (los que ya son señuelo no cuentan) */
export const enElAire = () => missiles.some(m => m.tipo === 'wolf' && !m.done && !m.senuelo);

const RANGO = { salva: 3, fija: 2, recarga: 1, fuera: 0 };
/** LO QUE VE EL RENDER Y EL HUD: la del lanzador MAS AMENAZANTE adentro de su zona (salva > fija >
 *  recarga), cuanto va de su fase (0..1), desde donde tira (`ox`, `oz`) y si estas adentro. */
export function snapshot(pz) {
  const L = lanzadores();
  let best = null, bc = null;
  for (const l of L) {
    const c = ciclos.get(l.k), f = c && dentroDe(l, pz) ? c.fase : 'fuera';
    if (!best || RANGO[f] > RANGO[bc ? bc.fase : 'fuera'] || (RANGO[f] === RANGO[bc ? bc.fase : 'fuera'] && !l.escolta && best.escolta)) {
      best = l; bc = c && dentroDe(l, pz) ? c : null;
    }
  }
  const sD = best ? best.D : D;
  const fase = bc ? bc.fase : 'fuera';
  const recarga = best && best.k !== 'respaldo' ? sD.recarga * (best.estado === 'danado' ? 2 : 1) : SW_RECARGA;
  const dur = !best || !bc ? 1 : fase === 'fija' ? sD.fija : fase === 'recarga' ? recarga : sD.cada;
  return { tipo: best ? best.fam : tipo, nombre: sD ? sD.nombre : '', alcance: sD ? sD.alcance : 0, dentro: !!bc,
    fase, u: bc ? Math.min(1, bc.t / dur) : 0, bz: best ? best.z : blanco.z, bzb: blanco.z, ox: best ? best.x : BL.X,
    on: !!best && blanco.on && !blanco.hundido,
    humos: humos.map(h => ({ u: h.edad / HUMO_VIDA, dx: h.dx, dz: h.dz || 0, s: h.semilla })) };
}

export function reset() { ciclos.clear(); humos.length = 0; }
