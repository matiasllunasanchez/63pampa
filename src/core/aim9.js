// EL SIDEWINDER (AIM-9L): el misil de los Sea Harrier. La matematica, sola y PURA.
//
// POR QUE EXISTE (pedido del autor, 30/9/2026): el Harrier dejo de "tirar y errar". De atras
// soltaba rafagas que no tenian codigo de impacto —el aviso era el contenido— y de frente los
// cazas armados del pasillo tiraban un par de trazadoras por pasada. Las dos cosas se van y quedan
// UNO o DOS misiles por Harrier: termicos, que se VEN venir y te SIGUEN, y que se esquivan de dos
// formas distintas segun de donde vengan.
//
// DOS GEOMETRIAS, UNA SOLA ARMA:
//
//   'cola'    te lo tira el Harrier que tenes atras (LA COLA, systems/caza.js). Te sigue de a poco
//             y NO se lo saca moviendose: copia todo lo que hagas. La unica salida es una MANIOBRA
//             (una pirueta del catalogo, `run.mv`) hecha cuando ya esta CERCA — ahi pierde el
//             blanco y SIGUE DE LARGO. Antes de eso, una pirueta no le hace nada: el buscador
//             todavia tiene tiempo de corregir. Es exactamente el truco de los pilotos del 82
//             contra el AIM-9L: quebrar tarde, cuando al misil ya no le da el radio de giro.
//
//   'frente'  te lo tira un caza del pasillo que viene de cara (systems/collision.js). Sale
//             APUNTADO a donde estabas y corrige POCO: se inclina pero no quiebra. Se esquiva
//             como cualquier cosa de frente, corriendose — no hace falta maniobra (si la haces y
//             no lo chocas, tambien vale: el perfil de colision se encoge igual que con todo).
//
// POR QUE LA COLA ES UNA REGLA Y NO UNA PERSECUCION FISICA. Se probo pensarlo como un misil que
// cierra con velocidad y giro limitados, y el resultado es uno de dos: o el jugador lo deja atras
// corriendose de costado (el avion hace 30 u/s de lado) y la maniobra sobra, o el misil gira tan
// rapido que ninguna maniobra lo saca. Lo que el autor pidio es la regla del medio —"te sigue, se
// va acercando, y solo una maniobra a tiempo lo pierde"—, asi que se escribe como regla: la
// posicion es un camino de aproximacion ATADO al avion (lo que hagas, lo copia) y el desenlace se
// decide por la maniobra dentro de la zona. Es legible y no tiene casos raros de borde.
//
// PURO: no importa stores ni canvas. Quien llama le pasa el blanco (`b`) ya resuelto — asi lo
// mide `npm run unit` en node y lo usa collision.js en el juego con la MISMA cuenta.
//
//   b = { x, y, vx, vy, spd, pz, maniobra, tight }
//       la posicion y velocidad del avion, `run.spd`, la profundidad del avion (PZ), si hay una
//       pirueta en curso (`!!run.mv`) y si esa pirueta encoge el perfil (`mvTight`).
import { AIM9 } from '../data/tuning.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Un AIM-9L que sale desde ATRAS (el Harrier de LA COLA, asomado en `desde`).
 *  Guarda el camino relativo al avion: de donde sale respecto de vos. */
export function lanzarCola(desde, b, P = AIM9) {
  return {
    tipo: 'aim9', modo: 'cola', fase: 'guia', t: 0, done: false,
    x: desde.x, y: desde.y, z: desde.z,
    // el camino: el corrimiento con que nace, que se va cerrando hasta cero (ver pasoCola)
    dx0: desde.x - b.x, dy0: desde.y - b.y, dz0: desde.z - b.pz,
    // EL BUSCADOR se queda un pelo atras de lo que hace el avion (COLA_LAG): es lo que hace que se
    // lo vea CORREGIR en vez de moverse pegado como una calcomania. Se apaga al llegar.
    ax: b.x, ay: b.y,
    vx: 0, vy: 0, vz: 0,
    zona: false,              // ya entro a la ventana de quiebre (el aviso se da una vez)
    seed: (desde.x * 7.13 + desde.z * 3.1) % 6.283,   // desfase del cabeceo, sin azar
    tr: [], trT: 0,           // la estela (ver `estela`)
  };
}

/** Un AIM-9L que sale DE FRENTE (un caza del pasillo en `desde`), apuntado a donde estas ahora.
 *
 *  SALE APUNTADO y despues corrige poco. Apuntar al salir es lo que hace que quedarse quieto sea
 *  morir; corregir poco es lo que hace que correrse sea vivir. Las dos mitades juntas son el "te
 *  sigue un poco, pero no gira bruscamente" del pedido. */
export function lanzarFrente(desde, b, P = AIM9) {
  const cierre = b.spd + P.FRENTE_V;
  const tti = Math.max(0.3, (desde.z - b.pz) / Math.max(1, cierre));
  return {
    tipo: 'aim9', modo: 'frente', fase: 'guia', t: 0, done: false,
    x: desde.x, y: desde.y, z: desde.z,
    // la puntería del disparo: el camino recto de donde sale a donde estabas
    vx: (b.x - desde.x) / tti, vy: (b.y - desde.y) / tti, vz: 0,
    // y la correccion, que arranca en cero y se gana despacio (FRENTE_ACC)
    cx: 0, cy: 0,
    seed: (desde.x * 5.3 + desde.z * 1.7) % 6.283,
    tr: [], trT: 0,
  };
}

/** UN CUADRO. Devuelve el EVENTO del cuadro, o null:
 *
 *    'zona'      (cola) entro a la ventana de quiebre: es el momento de maniobrar. Una vez.
 *    'pierde'    (cola) maniobraste en la zona: perdio el blanco y sigue de largo.
 *    'impacto'   te alcanzo (cola: llego sin que rompieras · frente: te cruzo dentro de la caja).
 *    'cruza'     (frente) te cruzo por afuera de la caja: lo esquivaste.
 *    'fin'       ya no juega (se fue lejos, se apago): hay que sacarlo del mundo.
 *
 *  Muta `m`. Las fases terminales ('perdido', 'pasa') siguen moviendolo hasta 'fin' para que se
 *  lo vea irse: un misil que desaparece en el aire al fallar se lee como un bug, no como un esquive. */
export function pasoAim9(m, dt, b, P = AIM9) {
  m.t += dt;
  const ev = m.modo === 'cola' ? pasoCola(m, dt, b, P) : pasoFrente(m, dt, b, P);
  estela(m, dt, b, P);
  return ev;
}

/** LA ESTELA: el camino que hizo, punto a punto, EN EL MARCO DEL MUNDO. El humo se queda donde lo
 *  dejo el motor y el mundo se lo lleva a la velocidad del avion (`b.spd`) — por eso de frente se
 *  estira hacia atras del misil, hasta el caza que lo tiro, y de atras se abre hacia la camara. */
function estela(m, dt, b, P) {
  for (const p of m.tr) { p.z -= b.spd * dt; p.e += dt; }
  while (m.tr.length && (m.tr[0].e > P.ESTELA_VIDA || m.tr[0].z < 1)) m.tr.shift();
  m.trT -= dt;
  if (m.trT <= 0 && m.fase !== 'impacto') {
    m.trT = P.ESTELA_DT;
    m.tr.push({ x: m.x, y: m.y, z: m.z, e: 0 });
    if (m.tr.length > P.ESTELA_N) m.tr.shift();
  }
}

/** La velocidad del misil contra el AIRE, en el marco de la camara: hacia donde apunta su nariz.
 *  La lee el dibujo para elegir la vista de la hoja y girarla. (La camara vuela hacia +z a
 *  `spd`: lo que para ella esta quieto, contra el aire va a `spd`.) */
export function velAire(m, spd, P = AIM9) {
  if (m.modo === 'frente') return { x: m.vx + m.cx, y: m.vy + m.cy, z: -P.FRENTE_V };
  return { x: m.vx, y: m.vy, z: m.vz + spd };
}

/** Fraccion del camino recorrido (cola): 0 al salir, 1 al llegar. */
export const avance = (m, P = AIM9) => clamp(m.t / P.COLA_T, 0, 1);

function pasoCola(m, dt, b, P) {
  if (m.fase === 'perdido') return seVa(m, dt, P);
  const u = avance(m, P);
  // EL BUSCADOR, un pelo atrasado (cosmetico: el impacto no depende de esto, ver abajo)
  const k = clamp(dt / P.COLA_LAG, 0, 1);
  m.ax += (b.x - m.ax) * k; m.ay += (b.y - m.ay) * k;
  // el atraso se apaga al llegar: en el ultimo tramo el misil ESTA en tu cola, no cerca de ella
  const w = 1 - u * u;
  const bx = b.x + (m.ax - b.x) * w, by = b.y + (m.ay - b.y) * w;
  // EL CAMINO. De costado y de altura cierra con (1-u)^2 —rapido al principio, fino al final: se
  // pone en tu cola enseguida y despues se te viene encima—, y de profundidad cierra parejo, que
  // es lo que en pantalla se lee como "se va acercando".
  const q = (1 - u) * (1 - u);
  const cab = Math.sin(m.t * 9.5 + m.seed) * P.COLA_WOB * (1 - u);   // el buscador cabecea
  const x = bx + m.dx0 * q + cab, y = by + m.dy0 * q + cab * 0.45;
  const z = b.pz + m.dz0 * (1 - u);
  // VELOCIDAD, medida del propio camino: la necesita el dibujo (hacia donde apunta la nariz) y la
  // necesita el quiebre (con que se va de largo). Suavizada, y medida ANTES de que el cuadro del
  // quiebre la contamine con el tirón de la pirueta.
  const s = clamp(dt * 12, 0, 1), idt = 1 / Math.max(dt, 1e-4);
  m.vx += ((x - m.x) * idt - m.vx) * s;
  m.vy += ((y - m.y) * idt - m.vy) * s;
  m.vz += ((z - m.z) * idt - m.vz) * s;
  m.x = x; m.y = y; m.z = z;

  let ev = null;
  if (!m.zona && u >= P.COLA_ZONA) { m.zona = true; ev = 'zona'; }
  // LA REGLA DE LA COLA: una pirueta con el misil en la zona lo pierde. Vale cualquiera del
  // catalogo, y vale si ya venias haciendola al entrar — lo que cuenta es estar maniobrando
  // CUANDO esta cerca, no el cuadro exacto en que apretaste.
  if (m.zona && b.maniobra) {
    m.fase = 'perdido'; m.tp = 0;
    // SIGUE DE LARGO: con la velocidad que traia (no puede copiar tu quiebre: por eso lo perdio),
    // adelantandose rapido, y abriendose hacia el lado del que vino — si no, pasaria justo por
    // encima de tu avion y un esquive se leeria como un impacto.
    const lado = m.dx0 >= 0 ? 1 : -1;
    m.vx = m.vx + lado * P.PASA_KICK;
    m.vy = m.vy * 0.5 + P.PASA_KICK * 0.25;
    m.vz = P.PASA_VZ;
    return 'pierde';
  }
  if (u >= 1) { m.fase = 'impacto'; m.done = true; return 'impacto'; }
  return ev;
}

/** El que perdio el blanco: recto, adelantandose, hasta perderse. */
function seVa(m, dt, P) {
  m.tp += dt;
  m.x += m.vx * dt; m.y += m.vy * dt; m.z += m.vz * dt;
  return m.tp >= P.PERDIDO_T || m.z > P.FIN_Z ? 'fin' : null;
}

function pasoFrente(m, dt, b, P) {
  m.z -= (b.spd + P.FRENTE_V) * dt;
  if (m.fase === 'guia') {
    // LA CORRECCION: hacia donde estas AHORA, pero con dos topes — cuanto puede corregir
    // (FRENTE_LAT) y que tan rapido puede cambiar de idea (FRENTE_ACC). El segundo es el que
    // impide que "gire bruscamente": aunque te vea irte, tarda en acompañarte.
    const tti = Math.max(0.15, (m.z - b.pz) / Math.max(1, b.spd + P.FRENTE_V));
    const qx = clamp((b.x - (m.x + m.vx * tti)) / tti, -P.FRENTE_LAT, P.FRENTE_LAT);
    const qy = clamp((b.y - (m.y + m.vy * tti)) / tti, -P.FRENTE_LAT, P.FRENTE_LAT);
    const a = P.FRENTE_ACC * dt;
    m.cx += clamp(qx - m.cx, -a, a);
    m.cy += clamp(qy - m.cy, -a, a);
  }
  m.x += (m.vx + m.cx) * dt;
  m.y += (m.vy + m.cy) * dt;
  // TE CRUZA: se resuelve UNA vez, en el plano del avion, con la misma caja que cualquier misil
  // de frente (y la misma que se encoge con una pirueta de alas de canto).
  if (m.fase === 'guia' && m.z <= b.pz + 1.2) {
    const rx = b.tight ? P.CAJA.rxT : P.CAJA.rx, ry = b.tight ? P.CAJA.ryT : P.CAJA.ry;
    if (Math.abs(b.x - m.x) < rx && Math.abs(b.y - m.y) < ry) { m.fase = 'impacto'; m.done = true; return 'impacto'; }
    m.fase = 'pasa';
    return 'cruza';
  }
  if (m.z <= 2 || m.t > P.VIDA) return 'fin';
  return null;
}
