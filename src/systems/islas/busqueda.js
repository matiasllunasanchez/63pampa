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
// LAS FASES (rehechas el 26/11, el autor: "que sea sencillo y que el contador indique"):
//   'bengalas'  seguir las bengalas y barrer con el radar: al lado de algunas hay un GRUPO DE BALSAS (se ven, con su
//               circulo verde donde tirar el humo); las otras estan solas. Cada grupo se MARCA con la bengala de humo
//   'informar'  todos marcados: SUBI arriba de 260 m cerca del humo y PRENDE EL RADAR para informar la posicion
//   'hecho'     el destructor va para alla: a casa
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

/** Arma la zona adelante de (x, z) con rumbo `yaw`. `encuentra` false = la salida que no vio nada (el 2-P-112).
 *  (26/11, el autor: "que sea sencillo: pocas bengalas, 3 o 4, y 2 o 3 grupos de balsas cerca; 1 o 2 bengalas solas,
 *  lejos, sin balsas; y que el contador indique"): BUSQ.BENGALAS bengalas, BUSQ.GRUPOS de ellas con un GRUPO de balsas
 *  al lado (las mas cerca de la entrada); las demas, solas y mas lejos. Sin mancha ni indicios falsos. */
export function armar(x, z, yaw, { encuentra = true, semilla = 1 } = {}) {
  sem = semilla >>> 0 || 1;
  const [fx, fz] = dir(yaw);
  B.on = true; B.encuentra = encuentra; B.cx = x + fx * BUSQ.ZONA_A; B.cz = z + fz * BUSQ.ZONA_A;
  B.fase = encuentra ? 'bengalas' : 'barrido';
  B.quedan = BUSQ.HUMOS; B.humos = []; B.vueltas = 0; B.yawAnt = null; B.ev.length = 0; B.lejosT = 0;
  B.ind = []; B.mancha = null; B.balsas = null; B.grupos = []; B.final = null;
  // LAS BENGALAS: separadas entre si, ninguna pegada a la entrada; las de las balsas, mas cerca; las solas, mas lejos
  B.beng = [];
  const ponerBeng = (d0, d1) => {
    for (let t = 0; t < 400; t++) {
      const a = rnd() * Math.PI * 2, r = d0 + rnd() * (d1 - d0);
      const bx = B.cx + Math.cos(a) * r, bz = B.cz + Math.sin(a) * r;
      if (Math.hypot(bx - x, bz - z) < BUSQ.BENGALA_SEP) continue;
      if (B.beng.some(q => Math.hypot(q.x - bx, q.z - bz) < BUSQ.BENGALA_SEP)) continue;
      B.beng.push({ x: bx, z: bz, viva: true, barrido: 0, f: rnd() * 30, grupo: -1 });
      return true;
    }
    return false;
  };
  const nG = encuentra ? BUSQ.GRUPOS : 0;
  for (let k = 0; k < BUSQ.BENGALAS; k++) ponerBeng(...(k < nG ? BUSQ.BENGALA_D : BUSQ.BENGALA_SOLA_D));
  // LOS GRUPOS DE BALSAS: al lado de su bengala (a GRUPO_A m), cada uno con su racimo
  for (let k = 0; k < nG && k < B.beng.length; k++) {
    const q = B.beng[k], a = rnd() * Math.PI * 2;
    const g = { x: q.x + Math.cos(a) * BUSQ.GRUPO_A, z: q.z + Math.sin(a) * BUSQ.GRUPO_A, vista: false, marcada: false, lista: [] };
    racimo(g); B.grupos.push(g); q.grupo = k;
  }
  if (!encuentra) B.sect = Array(8).fill(false);   // EL BARRIDO: ocho sectores de la zona
}
function racimo(g) {
  g.lista = [];
  for (let i = 0; i < BUSQ.BALSAS_N; i++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * BUSQ.RACIMO;
    g.lista.push({ x: g.x + Math.cos(a) * r, z: g.z + Math.sin(a) * r, rot: rnd() * Math.PI, f: rnd() * 6 });
  }
}

/** Cuanto se ve desde `alto` m sobre el mar: nada adentro de la nube; mas abajo, mas lejos. */
export function vista(alto) {
  if (alto >= BUSQ.TECHO) return 0;
  const k = Math.max(0, Math.min(1, (alto - BUSQ.BAJO) / (BUSQ.TECHO - BUSQ.BAJO)));
  return BUSQ.VISTA_BAJO + (BUSQ.VISTA - BUSQ.VISTA_BAJO) * k;
}
const marcadas = () => B.grupos.filter(g => g.informada).length;   // (las que ya se informaron: el contador)
/** ¡Balsas a las N! — en horas de reloj desde la trompa (el «¡Balsa a las 11!» del 2-P-111) */
function verGrupo(g, a, radar) {
  if (g.vista) return;
  let rel = Math.atan2(g.x - a.x, -(g.z - a.z)) - a.yaw;
  rel = ((rel % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  g.vista = true; B.ev.push({ k: 'grupo', reloj: Math.round(rel / (Math.PI / 6)) % 12 || 12, radar: !!radar });
}

/** Un cuadro. `a` = { x, z, yaw, alto (m sobre el mar), suelta (true el cuadro en que se aprieta el humo), radar, dt }. */
export function paso(dt, a) {
  if (!B.on) return;
  B.ult = a;   // (la sonda `__busqueda('aca')`, y la altura para la consigna)
  const v = vista(a.alto);
  for (const h of B.humos) h.t += dt;
  B.humos = B.humos.filter(h => h.t < BUSQ.HUMO_S);
  // EL HUMO: lo suelta la BENGALA que cae como una bomba (game.js `tryLaunchMissile`, islas.js `bombas` -> `humoEn`)
  if (a.suelta) { const [fx, fz] = dir(a.yaw); humoEn(a.x + fx * 60, a.z + fz * 60); }
  // LAS BALSAS SE VEN A OJO, debajo de las nubes y cerca
  if (B.fase === 'bengalas' && v > 0) for (const g of B.grupos) if (!g.vista && Math.hypot(g.x - a.x, g.z - a.z) < v + BUSQ.RACIMO) verGrupo(g, a, false);
  // EL RADAR CERCA DE UNA BENGALA: si tiene balsas al lado, aparecen; si no, LISTO, a la siguiente
  // (`B.barre`: lo barrido de la que se esta barriendo ahora, 0..1, para el cartel de avance)
  B.barre = 0;
  if ((B.fase === 'bengalas' || B.fase === 'barrido') && a.radar && a.alto >= BUSQ.RADAR_ALT) {
    for (let i = 0; i < B.beng.length; i++) {
      const q = B.beng[i];
      if (!q.viva || Math.hypot(q.x - a.x, q.z - a.z) > BUSQ.BENGALA_R) continue;
      q.barrido += dt;
      B.barre = Math.min(1, q.barrido / BUSQ.BENGALA_S);
      if (q.barrido < BUSQ.BENGALA_S) continue;
      q.viva = false;
      if (q.grupo >= 0) verGrupo(B.grupos[q.grupo], a, true);
      else B.ev.push({ k: 'bengalaVacia', quedan: B.beng.filter(z => z.viva).length });
      break;
    }
  }
  // INFORMAR LA POSICION (26/11, el autor: "subir a los 260 metros, quedarme en un radio del humo y lanzar radar 3 o 4
  // segundos, y ahi gano"): arriba de CIRCULO_ALT, a menos de CIRCULO_R del humo y con el RADAR prendido, CIRCULO_S s
  if (B.fase === 'informar') {
    const h = B.final;
    B.cerca = !!h && Math.hypot(h.x - a.x, h.z - a.z) < BUSQ.CIRCULO_R;
    if (B.cerca && a.alto >= BUSQ.CIRCULO_ALT && a.radar) B.vueltas += dt;
    if (B.vueltas >= BUSQ.CIRCULO_S) {
      const g = B.grupos.find(q => q.humo === B.final); if (g) g.informada = true;
      const m = B.grupos.filter(q => q.informada).length;
      if (m >= B.grupos.length) { B.fase = 'hecho'; B.ev.push({ k: 'tomadas' }); }
      else { B.fase = 'bengalas'; B.final = null; B.vueltas = 0; B.ev.push({ k: 'informada', m, n: B.grupos.length }); }
    }
  }
  // EL BARRIDO (sin balsas): los sectores del anillo, pasados bajo el techo
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
/** Cuantos marcadores de humo quedan. */
export const humosQuedan = () => (B.on ? B.quedan : 0);
/** SOLTASTE UNA BENGALA (26/11, el autor: "con apretar R3 dentro de la zona o en frente deberia ser suficiente"): si el
 *  avion esta adentro de la cupula de un grupo visto sin marcar —o lo tiene adelante, a menos de FRENTE m— lo marca
 *  ahi mismo, con el humo en el grupo. Devuelve true si marco (la bengala que cae ya no hace otro humo). */
export function bengalaSuelta() {
  const a = B.ult;
  if (!B.on || !a || B.quedan <= 0) return false;
  const [fx, fz] = dir(a.yaw);
  const g = B.grupos.find(q => {
    if (!q.vista || q.marcada) return false;
    const dx = q.x - a.x, dz = q.z - a.z, d = Math.hypot(dx, dz);
    return d < BUSQ.MARCA * 1.3 || (d < BUSQ.FRENTE && (dx * fx + dz * fz) / d > Math.cos(BUSQ.FRENTE_ANG * DEG));
  });
  if (!g) return false;
  humoEn(g.x, g.z);
  return true;
}
/** EL HUMO NACE ACA (x, z del mapa): donde la bengala toco el agua. Si cae adentro del circulo de un grupo visto y sin
 *  marcar, lo marca; con todos marcados, a INFORMAR la posicion. */
export function humoEn(hx, hz) {
  if (!B.on) return;
  if (B.quedan <= 0) { B.ev.push({ k: 'sinHumo' }); return; }
  B.quedan--;
  B.humos.push({ x: hx, z: hz, t: 0 });
  const g = B.grupos.find(q => q.vista && !q.marcada && Math.hypot(hx - q.x, hz - q.z) < BUSQ.MARCA);
  B.ev.push({ k: 'humo', ok: !!g, quedan: B.quedan });
  if (!g) return;
  g.marcada = true; g.humo = { x: hx, z: hz };
  // (26/11, el autor: "le tire la bengala y me dice SEGUI LAS BENGALAS, pero todavia tengo que subir y llamar al destructor
  // para informar la posicion"): CADA grupo marcado se informa enseguida — despues se sigue con el resto
  B.final = g.humo; B.vueltas = 0; B.fase = 'informar'; B.ev.push({ k: 'marcadas' });
}

/** Hacia donde marca la brujula: nada mientras se buscan (se siguen las bengalas); al informar, el humo final —arriba
 *  de las nubes no se ve nada (26/11, el autor: "el humo debe verse a traves de las nubes, debo saber por donde girar"). */
export function blanco() {
  if (B.fase === 'informar' && B.final) return { ...B.final, n: 'busq_humo_marca' };
  // (…y el grupo visto sin marcar mas cercano: si te alejaste, la brujula dice a donde volver)
  const a = B.ult, gs = B.grupos ? B.grupos.filter(g => g.vista && !g.marcada) : [];
  if (!gs.length) return null;
  const g = a ? gs.reduce((m, q) => (Math.hypot(q.x - a.x, q.z - a.z) < Math.hypot(m.x - a.x, m.z - a.z) ? q : m)) : gs[0];
  return { x: g.x, z: g.z, n: 'busq_balsas_marca' };
}

/** Lo que muestra el tablero: la fase, los humos, el progreso, el barrido de la bengala, las balsas marcadas, si hay un
 *  grupo visto sin marcar (`marcar`) y donde esta el avion respecto del final (`alto`, `cerca`). */
export function hud() {
  if (!B.on) return null;
  const prog = B.fase === 'informar' ? Math.min(1, B.vueltas / BUSQ.CIRCULO_S)
    : B.fase === 'barrido' ? B.sect.filter(Boolean).length / 8 : null;
  return { fase: B.fase, humos: B.quedan, prog, barre: B.barre || 0, marcadas: marcadas(), grupos: B.grupos.length,
    marcar: B.grupos.some(g => g.vista && !g.marcada), alto: B.ult ? B.ult.alto : 0, cerca: !!B.cerca };
}

/** Para el dibujo 3D (busqueda3d.js) y el mapa: lo que hay en el agua. Las balsas, solo las de los grupos vistos; los
 *  CIRCULOS donde tirar el humo (26/11: "que haya una zona clara para tirar el humo"), de los vistos sin marcar. */
export function escena() {
  if (!B.on) return null;
  const vistos = B.grupos.filter(g => g.vista);
  return { mancha: null, ind: B.ind, humos: B.humos, zona: { x: B.cx, z: B.cz, r: BUSQ.ZONA_R }, bengalas: B.beng,
    balsas: vistos.length ? vistos.flatMap(g => g.lista) : null,
    circulos: [...vistos.filter(g => !g.marcada).map(g => ({ x: g.x, z: g.z, r: BUSQ.MARCA })),
      ...(B.fase === 'informar' && B.final ? [{ x: B.final.x, z: B.final.z, r: BUSQ.CIRCULO_R }] : [])] };
}

/** La sonda: el estado entero (tools / __busqueda) */
export const debug = () => ({ fase: B.fase, c: [Math.round(B.cx), Math.round(B.cz)], humos: B.quedan, vueltas: +B.vueltas.toFixed(2), sect: B.sect,
  grupos: B.grupos.map(g => [Math.round(g.x), Math.round(g.z), g.vista, g.marcada]),
  beng: B.beng && B.beng.map(q => [Math.round(q.x), Math.round(q.z), q.viva, q.grupo]) });

// SONDA: __busqueda() el estado; __busqueda('mancha'|'balsas') te lleva encima (para probar sin barrer)
if (typeof window !== 'undefined') window.__busqueda = q => {
  // 'marcar': marca los grupos que falten (para probar el final sin tirar las bengalas)
  if (q === 'marcar') { for (const g of B.grupos) if (!g.marcada) { g.vista = true; humoEn(g.x, g.z); } return B.fase; }
  const g0 = B.grupos && B.grupos.find(g => !g.marcada);
  if (q === 'balsas' && g0) return JSON.stringify({ x: g0.x, z: g0.z });
  // 'aca': el proximo grupo sin marcar, visto, 220 m adelante de la trompa (para mirarlo sin buscarlo)
  if (q === 'aca' && g0 && B.ult) {
    const [fx, fz] = dir(B.ult.yaw); g0.x = B.ult.x + fx * 220; g0.z = B.ult.z + fz * 220; racimo(g0);
    g0.vista = true; return 'ok';
  }
  return JSON.stringify(debug());
};
