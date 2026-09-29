// LA GEOGRAFIA DEL PASILLO (docs/sistemas/PLAN_GEOGRAFIA.md) — que hay ABAJO, tramo por tramo.
//
// QUE ES: la lista `geografia:` de una mision parte el camino en etapas de terreno —mar, costa,
// tierra— por FRACCION de `objectiveDist`, de 0 a 2 en IDA Y VUELTA (la vuelta sigue el odometro
// pasado el buque). Hasta ahora el terreno era UNA palabra para la mision entera (`cfg.terrain`);
// con esto, la pregunta "que suelo hay aca" pasa a tener respuesta por distancia.
//
// LA PREGUNTA SE HACE POR PROFUNDIDAD, y de eso sale todo lo demas. El raster del suelo pinta
// filas, y cada fila YA sabe a que distancia esta: si cada fila pregunta por su suelo, una isla a
// 180 m se pinta en las filas de arriba mientras las de abajo siguen siendo mar. Se la ve venir
// desde el horizonte y se acerca sola, sin un solo sistema de "aparicion".
//
// POR QUE EL STORE VIVE ACA y no en systems/: lo leen el render, el vuelo y la siembra, y el
// render no puede importar systems (lint de capas). Es el precedente de `zz` en core/zigzag.js:
// un store chico + funciones que lo leen, en core.
//
// LA REGLA SUPREMA (§0 del plan): sin `geografia:`, TODA pregunta de este archivo contesta lo
// mismo que contestaba `cfg.terrain` antes de que existiera. Hay un unit test que lo recorre.

import { cfg } from './state.js';
import { tierraH, hayRelieve } from './tierra.js';
import { shoreAt, TIERRA_AMP, GEO_COSTURA, GEO_PLAYA, GEO_PLAYA_ONDA, GEO_ORILLA_ENTRA, GEO_ORILLA_LEJOS,
  GEO_ISLA_ALTO, GEO_ISLA_ALTO_MAX, GEO_ISLA_PENDIENTE, GEO_ISLA_CARA, GEO_ISLA_FLANCO, GEO_ISLA_PLAYA,
  FLY_X } from '../data/tuning.js';

/** Los suelos de la data (en castellano, que es como se escribe una mision) y el codigo interno
 *  con el que el juego ya los conocia (`cfg.terrain`). Traducir aca y no en cada lector es lo que
 *  deja intactas las ramas de siempre: el raster sigue preguntando `=== 'land'`. */
export const SUELOS = { mar: 'sea', costa: 'coast', tierra: 'land', isla: 'sea' };
// LA ISLA ES MAR DE BASE (G4): el raster pinta agua alrededor, la siembra la trata como agua, y lo
// que la hace isla es su RELIEVE — `islaAltura`, que leen el vuelo (`alturaSuelo`), la pregunta de
// "hay tierra aca" (`esTierraEn`) y el dibujo por rebanadas de render/islas.js. Traducirla a 'sea'
// deja a todos los lectores de `sueloEn` en su rama de siempre sin tocarlos.
export const LADOS = ['izq', 'der'];

/** LAS CLAVES QUE HOY HACEN ALGO. Las del plan que todavia no existen (la `isla` y las suyas) NO
 *  estan, y a proposito: una clave aceptada que no hace nada es la peor forma de fallar — el mapa
 *  se escribe, se valida, y no pasa nada. Cada fase agrega las suyas (G2: `niebla`; G3: `paredes`
 *  y `barrera`). */
export const CLAVES = ['hasta', 'suelo', 'lado', 'lomas', 'niebla', 'paredes', 'barrera',
  'alto', 'ancho', 'x', 'borde', 'expone'];
/** Las claves que solo tienen sentido en una isla (G4). */
export const CLAVES_ISLA = ['alto', 'ancho', 'x', 'borde', 'expone'];
/** Como se entra a la isla: una loma que sube (se sigue con el gas) o un farallon (se choca). */
export const BORDES = ['playa', 'acantilado'];
/** De que lado hay ACANTILADO (G3). Es otra pregunta que el `lado` de una costa — la costa dice
 *  donde queda la tierra baja; las paredes, donde hay roca que mata. */
export const PAREDES = ['izq', 'der', 'ambos'];
/** Las barreras que un tramo puede PONER (G3): las cuatro pieles del zigzag (Z8). */
export const BARRERAS = ['roca', 'puente', 'madera', 'cables'];

/** Revisa una lista y devuelve los ERRORES en texto (vacia = sana). `undefined` es valido: una
 *  mision sin geografia es casi todas las misiones. */
export function validarGeografia(lista) {
  const e = [];
  if (lista === undefined || lista === null) return e;
  if (!Array.isArray(lista)) return ['`geografia` tiene que ser una lista'];
  if (!lista.length) return ['`geografia` no puede ser una lista vacia (sacala y listo)'];
  let prev = 0, sueloPrev = null, ladoPrev = null;
  lista.forEach((t, i) => {
    if (!t || typeof t !== 'object' || Array.isArray(t)) { e.push(`tramo ${i}: no es un objeto`); return; }
    // HASTA en (0, 2]: la vuelta de IDA Y VUELTA va de 1 a 2. Estrictamente creciente, o un tramo
    // puede quedar tapado por el anterior y no existir nunca — en silencio.
    if (typeof t.hasta !== 'number' || !(t.hasta > 0) || t.hasta > 2)
      e.push(`tramo ${i}: 'hasta' tiene que ser una fraccion en (0, 2] y es ${JSON.stringify(t.hasta)}`);
    else if (t.hasta <= prev) e.push(`tramo ${i}: 'hasta' ${t.hasta} no es mayor que el anterior (${prev})`);
    else prev = t.hasta;
    if (!Object.prototype.hasOwnProperty.call(SUELOS, t.suelo))
      e.push(`tramo ${i}: 'suelo' tiene que ser ${Object.keys(SUELOS).join(' | ')} y es ${JSON.stringify(t.suelo)}`);
    for (const k of Object.keys(t)) if (CLAVES.indexOf(k) < 0)
      e.push(`tramo ${i}: clave desconocida '${k}' (las que hoy funcionan: ${CLAVES.join(', ')})`);
    if (t.lado !== undefined && LADOS.indexOf(t.lado) < 0) e.push(`tramo ${i}: 'lado' tiene que ser izq | der`);
    if (t.lado !== undefined && t.suelo !== 'costa') e.push(`tramo ${i}: 'lado' solo tiene sentido en una costa`);
    if (t.lomas !== undefined && !(typeof t.lomas === 'number' && t.lomas >= 0 && t.lomas <= 12))
      e.push(`tramo ${i}: 'lomas' son metros de relieve, entre 0 y 12`);
    if (t.lomas !== undefined && t.suelo !== 'tierra') e.push(`tramo ${i}: 'lomas' solo tiene sentido en tierra`);
    // NIEBLA (G2): la densidad de las dos que el juego ya conoce (la fila NIEBLA de OPCIONES):
    // 1 = VISIBLE, 2 = CASI NULA. Vale sobre cualquier suelo — la bruma no pregunta que hay abajo.
    if (t.niebla !== undefined && t.niebla !== 1 && t.niebla !== 2)
      e.push(`tramo ${i}: 'niebla' es 1 (se ve algo) o 2 (casi nada) y es ${JSON.stringify(t.niebla)}`);
    // PAREDES Y BARRERA (G3): acantilados a los costados del tramo, y una barrera de lado a lado al
    // principio. Valen sobre cualquier suelo. La barrera exige los dos lados: con un costado
    // abierto cerraria un pasillo que no existe (la misma regla que el zigzag, ver `barreraDe`).
    if (t.paredes !== undefined && PAREDES.indexOf(t.paredes) < 0)
      e.push(`tramo ${i}: 'paredes' tiene que ser ${PAREDES.join(' | ')} y es ${JSON.stringify(t.paredes)}`);
    if (t.barrera !== undefined && BARRERAS.indexOf(t.barrera) < 0)
      e.push(`tramo ${i}: 'barrera' tiene que ser ${BARRERAS.join(' | ')} y es ${JSON.stringify(t.barrera)}`);
    if (t.barrera !== undefined && t.paredes !== 'ambos')
      e.push(`tramo ${i}: una 'barrera' necesita paredes: 'ambos' en el mismo tramo — con un lado abierto se la rodea`);
    // LA ISLA (G4)
    for (const k of CLAVES_ISLA) if (t[k] !== undefined && t.suelo !== 'isla')
      e.push(`tramo ${i}: '${k}' solo tiene sentido en una isla`);
    if (t.suelo === 'isla') {
      const alto = t.alto === undefined ? GEO_ISLA_ALTO : t.alto;
      if (!(typeof alto === 'number' && alto > 0 && alto <= 120))
        e.push(`tramo ${i}: 'alto' son los metros de la cumbre, entre 0 y 120`);
      else if (alto > GEO_ISLA_ALTO_MAX && t.expone !== true)
        e.push(`tramo ${i}: una isla de ${alto} m pasa el techo del radar (${GEO_ISLA_ALTO_MAX}) — cruzarla es comerse una oleada. Si es a proposito, 'expone: true'`);
      if (t.expone !== undefined && typeof t.expone !== 'boolean') e.push(`tramo ${i}: 'expone' es true o false`);
      if (t.ancho !== undefined && !(typeof t.ancho === 'number' && t.ancho > 0 && t.ancho <= 1))
        e.push(`tramo ${i}: 'ancho' es la fraccion del carril que tapa, en (0, 1]`);
      if (t.x !== undefined && !(typeof t.x === 'number' && Math.abs(t.x) <= FLY_X))
        e.push(`tramo ${i}: 'x' es donde esta centrada, dentro del carril (±${FLY_X})`);
      if (t.x !== undefined && (t.ancho === undefined || t.ancho >= 1))
        e.push(`tramo ${i}: 'x' solo sirve en una isla parcial ('ancho' < 1)`);
      if (t.borde !== undefined && BORDES.indexOf(t.borde) < 0)
        e.push(`tramo ${i}: 'borde' tiene que ser ${BORDES.join(' | ')}`);
      if (t.paredes !== undefined || t.barrera !== undefined)
        e.push(`tramo ${i}: una isla no lleva paredes ni barrera — la isla ES la barrera`);
    }
    // UNA ISLA ES TIERRA RODEADA DE AGUA: pegada a una costa o a una tierra no es una isla, es un
    // cerro de esa tierra, y la costura entre las dos no existe
    if (t.suelo === 'isla' && sueloPrev !== null && sueloPrev !== 'mar')
      e.push(`tramo ${i}: antes de una isla tiene que haber mar (hay ${sueloPrev})`);
    if (sueloPrev === 'isla' && t.suelo !== 'mar')
      e.push(`tramo ${i}: despues de una isla tiene que haber mar (hay ${t.suelo})`);
    // DOS COSTAS SEGUIDAS DE DISTINTO LADO: la orilla tendria que cruzar el carril en diagonal
    // para pasar de un lado al otro, que no es una costura sino un mapa ilegible. Con un tramo de
    // mar o de tierra en el medio, cada costa entra y sale por su costado como corresponde.
    const lado = t.lado || 'izq';
    if (t.suelo === 'costa' && sueloPrev === 'costa' && lado !== ladoPrev)
      e.push(`tramo ${i}: costa del otro lado pegada a una costa — poné un tramo de mar o de tierra en el medio`);
    sueloPrev = t.suelo; ladoPrev = lado;
  });
  return e;
}

// ---------------------------------------------------------------- EL STORE

/** La geografia de la corrida en curso. `tramos` es la lista ARMADA (en metros, con vecinos),
 *  que es lo que leen todos; `lista` es la data tal como vino. `sinSiembra` cuenta los sorteos
 *  que no se hicieron por caer sobre tierra (lo lee el fixture). */
export const geo = { lista: null, obj: 0, tramos: null, nieblas: null, zigzag: null, islas: [], sinSiembra: 0 };

/** Carga la geografia de la corrida. La llama systems/geografia.js (`cargar`), que es quien sabe
 *  si hay una sonda pisando la data; el orquestador llama a ESE, al lado de `setFases`, porque es
 *  donde ya se sabe `objectiveDist` y las fracciones sin su objetivo no son nada. */
export function setGeografia(lista, obj) {
  geo.obj = obj > 0 ? obj : 0;
  geo.lista = Array.isArray(lista) && lista.length ? lista : null;
  geo.tramos = geo.lista && geo.obj > 0 ? armar(geo.lista, geo.obj) : null;
  geo.nieblas = geo.tramos ? juntarNieblas(geo.tramos) : null;
  geo.zigzag = geo.tramos ? zigzagDe(geo.lista) : null;
  geo.islas = geo.tramos ? geo.tramos.filter(r => r.isla) : [];
  geo.sinSiembra = 0;
  cur = 0;
  return geo.tramos;
}

/** ¿La corrida tiene geografia? Si no, todo contesta `cfg.terrain` como siempre. */
export const geoActiva = () => geo.tramos !== null;

function armar(lista, obj) {
  const t = [];
  let d0 = 0;
  for (const e of lista) {
    const d1 = e.hasta * obj;
    t.push({
      d0, d1, suelo: SUELOS[e.suelo] || 'sea',
      s: e.lado === 'der' ? -1 : 1,                     // de que lado queda la tierra en una costa
      lomas: typeof e.lomas === 'number' ? e.lomas : TIERRA_AMP,
      prev: null, next: null,
      // LA ISLA (G4), ya resuelta con sus defaults. `m` es el medio ancho en metros (Infinity: tapa
      // el carril entero), `cx` el centro.
      isla: e.suelo === 'isla' ? {
        alto: typeof e.alto === 'number' ? e.alto : GEO_ISLA_ALTO,
        m: typeof e.ancho === 'number' && e.ancho < 1 ? e.ancho * FLY_X : Infinity,
        cx: typeof e.x === 'number' ? e.x : 0,
        borde: e.borde === 'acantilado' ? 'acantilado' : 'playa',
      } : null,
    });
    d0 = d1;
  }
  for (let i = 0; i < t.length; i++) { t[i].prev = t[i - 1] || null; t[i].next = t[i + 1] || null; }
  lista.forEach((e, i) => { t[i].niebla = e.niebla || 0; });
  return t;
}

/** LOS BANCOS DE NIEBLA que declara la geografia (G2), en metros y ya JUNTADOS: dos tramos seguidos
 *  con niebla son UN banco, no dos. Si fueran dos, el fundido bajaria a cero en la juntura y
 *  volveria a subir — un pozo de claridad en medio de la bruma que nadie escribio. La densidad del
 *  banco juntado es la mas cerrada de las dos. Null si la geografia no declara ninguna. */
function juntarNieblas(t) {
  const b = [];
  for (const r of t) {
    if (!r.niebla) continue;
    const ult = b[b.length - 1];
    if (ult && ult.z1 === r.d0) { ult.z1 = r.d1; ult.dens = Math.max(ult.dens, r.niebla); }
    else b.push({ z0: r.d0, z1: r.d1, dens: r.niebla });
  }
  return b.length ? b : null;
}

/** El banco de niebla de la geografia que RIGE a `d` metros: el que estas cruzando, o el proximo
 *  (o el que se esta desvaneciendo detras: `margen` son los metros de fundido a cada lado). Null
 *  si ya no queda ninguno por delante. */
export function bancoNiebla(d, margen) {
  const b = geo.nieblas;
  if (!b) return null;
  for (const n of b) if (d < n.z1 + (margen || 0)) return n;
  return null;
}

/** LOS ACANTILADOS Y LAS BARRERAS de la geografia (G3), escritos como un `zigzag:` — un tramo con
 *  `paredes:` es una VENTANA del callejon. No hay un sistema de paredes nuevo: es el del zigzag,
 *  que ya dibuja, choca, siembra alrededor y recorta, medido en dieciocho playtests. Lo que la
 *  geografia le agrega es decir DONDE, por tramo.
 *
 *  `amp: 0` (el carril no dobla: el pasillo sigue siendo pasillo), `barreras: 'no'` (sin sorteo:
 *  las barreras las pone la data) y `puestos: false` (sin antiaereos en las lomas — decision 3 del
 *  autor, 29/9: terreno primero, unidades despues). Null si ningun tramo declara paredes. */
export function zigzagDe(lista) {
  if (!Array.isArray(lista)) return null;
  const ventanas = [];
  let d0 = 0;
  for (const t of lista) {
    if (t.paredes) {
      const v = { desde: d0, hasta: t.hasta, lado: t.paredes };
      if (t.barrera) v.barrera = t.barrera;
      ventanas.push(v);
    }
    d0 = t.hasta;
  }
  if (!ventanas.length) return null;
  return { amp: 0, paredes: { mata: true, barreras: 'no', puestos: false }, ventanas };
}

// El ultimo tramo encontrado. Las preguntas llegan casi siempre en orden (las filas del raster van
// de lejos a cerca, el avion avanza), asi que arrancar la busqueda desde el ultimo la vuelve O(1)
// en la practica sin armar ningun indice.
let cur = 0;

/** El tramo que rige a `wz` metros, o null: sin geografia, o pasado el ultimo `hasta` (ahi, igual
 *  que en las fases, manda el cfg plano — si la lista no llega al final, es deliberado). */
export function tramoEn(wz) {
  const t = geo.tramos;
  if (!t) return null;
  if (wz < 0) return t[0];
  let i = cur < t.length ? cur : 0;
  while (i > 0 && wz < t[i].d0) i--;
  while (i < t.length && wz >= t[i].d1) i++;
  if (i >= t.length) return null;
  cur = i;
  return t[i];
}

/** EL SUELO a `wz` metros: 'sea' | 'coast' | 'land' — los mismos codigos de `cfg.terrain`. */
export function sueloEn(wz) {
  if (geo.tramos === null) return cfg.terrain;
  const r = tramoEn(wz);
  return r ? r.suelo : cfg.terrain;
}

// ---------------------------------------------------------------- LAS COSTURAS

const suave = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
/** El largo de una costura, TOPADO contra el tramo: `?qa` comprime la mision al 6% y una costura
 *  de 220 m en un tramo de 90 haria que la rampa nunca llegara a 1 — el tramo no existiria. Es la
 *  trampa que el zigzag ya encontro una vez (ver `ventana` en core/zigzag.js). */
const costura = (r, base) => Math.max(1, Math.min(base, (r.d1 - r.d0) * 0.35));

/** LA PLAYA QUE CRUZA EL CARRIL no es una recta: se despeina con la x del mundo, y cada playa de
 *  una forma distinta (la fase sale de donde esta). Determinista: la playa no titila. */
const onda = (x, d) => GEO_PLAYA_ONDA * (0.6 * Math.sin(x * 0.045 + d * 0.013) + 0.4 * Math.sin(x * 0.13 - d * 0.021));

/** ¿Entre estos dos suelos hay PLAYA QUE CRUZA? Solo mar <-> tierra. La costa ya tiene orilla
 *  propia, y lo que hace al entrar o salir de ella es correrla (ver `orillaS`). */
const cruza = (a, b) => (a === 'sea' && b === 'land') || (a === 'land' && b === 'sea');

/** LA ORILLA de una costa a `wz`, en el ESPACIO DEL LADO: con `x' = s * x`, hay tierra donde
 *  `x' < S`. Asi la costa de la derecha es la de la izquierda en espejo, y todo el codigo que ya
 *  sabia dibujar y chocar la costa sirve para las dos.
 *
 *  AL ENTRAR Y AL SALIR, LA ORILLA SE CORRE: viniendo del mar, arranca lejos del lado de la tierra
 *  (todo agua) y se acerca a su lugar; viniendo de tierra, arranca lejos del lado del agua (todo
 *  tierra) y se abre. O sea que la costa no aparece: ENTRA desde el costado. */
export function orillaS(wz) {
  const r = geo.tramos === null ? null : tramoEn(wz);
  let S = shoreAt(wz);
  if (!r || r.suelo !== 'coast') return S;
  const L = costura(r, GEO_ORILLA_ENTRA);
  if (r.prev && r.prev.suelo !== 'coast') {
    const ext = r.prev.suelo === 'land' ? GEO_ORILLA_LEJOS : -GEO_ORILLA_LEJOS;
    S = ext + (S - ext) * suave((wz - r.d0) / L);
  }
  if (r.next && r.next.suelo !== 'coast') {
    const ext = r.next.suelo === 'land' ? GEO_ORILLA_LEJOS : -GEO_ORILLA_LEJOS;
    S = ext + (S - ext) * suave((r.d1 - wz) / L);
  }
  return S;
}
/** De que lado queda la tierra de la costa a `wz`: 1 izquierda (la de siempre), -1 derecha. */
export function ladoEn(wz) {
  const r = geo.tramos === null ? null : tramoEn(wz);
  return r && r.suelo === 'coast' ? r.s : 1;
}

/** LA PLAYA CERCANA a `wz`, si hay una a menos de lo que ocupa (onda + arena + espuma). La usa el
 *  raster para saber que esa fila se pinta por COLUMNAS. Devuelve el borde en metros y hacia
 *  donde queda la tierra (+1: la tierra esta mas lejos; -1: mas cerca), o null. Reusa un objeto
 *  para no alocar por fila. */
const PLAYA = { d: 0, dir: 0 };
export function playaCerca(wz) {
  if (geo.tramos === null) return null;
  const r = tramoEn(wz);
  if (!r) return null;
  const alcance = GEO_PLAYA_ONDA + GEO_PLAYA + 3;
  if (r.prev && cruza(r.prev.suelo, r.suelo) && wz - r.d0 < alcance) {
    PLAYA.d = r.d0; PLAYA.dir = r.suelo === 'land' ? 1 : -1; return PLAYA;
  }
  if (r.next && cruza(r.suelo, r.next.suelo) && r.d1 - wz < alcance) {
    PLAYA.d = r.d1; PLAYA.dir = r.next.suelo === 'land' ? 1 : -1; return PLAYA;
  }
  return null;
}
/** Que hay en la columna `x` de una fila de playa: 0 agua · 1 espuma · 2 arena · 3 tierra. */
export function playaClase(x, wz, pl) {
  const b = pl.d + onda(x, pl.d);
  const u = pl.dir > 0 ? wz - b : b - wz;   // metros tierra adentro desde el filo del agua
  return u < 0 ? 0 : u < 1.6 ? 1 : u < GEO_PLAYA ? 2 : 3;
}

// ---------------------------------------------------------------- LO QUE VE, Y LO QUE MATA

/** ¿HAY TIERRA en este punto del mundo? La pregunta que decide si el avion roza agua o suelo, si
 *  la estela se dibuja, de que color salta el polvo. Sin geografia: la formula de siempre. */
export function esTierraEn(x, wz) {
  if (geo.tramos === null) return cfg.terrain === 'land' || (cfg.terrain === 'coast' && x < shoreAt(wz));
  const r = tramoEn(wz);
  if (r && r.isla) return islaBorde(x, wz, r) >= 0;
  const suelo = r ? r.suelo : cfg.terrain;
  if (suelo === 'coast') return (r ? r.s : 1) * x < orillaS(wz);
  // LA PLAYA ONDULADA puede meter tierra un poco adentro del tramo de mar vecino (o agua adentro
  // del de tierra): se pregunta por el FILO, no por el tramo.
  const pl = playaCerca(wz);
  if (pl) return playaClase(x, wz, pl) >= 1;
  return suelo === 'land';
}

/** EL RELIEVE en este punto: metros de suelo sobre el cero del mundo. La MISMA funcion la evaluan
 *  el vuelo (`groundY`), la siembra (`gy`) y el dibujo del pasto — lo que ves es lo que te mata.
 *
 *  Sin geografia es `hayRelieve ? tierraH : 0`, exactamente lo de T3. Con geografia, la loma de un
 *  tramo de tierra ARRANCA PLANA en sus costuras (una playa con lomas no es una playa) y escala con
 *  `lomas`. La tierra de una costa sigue plana, como siempre fue. */
export function alturaSuelo(x, wz) {
  if (geo.tramos === null) return hayRelieve(cfg) ? tierraH(x, wz) : 0;
  const r = tramoEn(wz);
  if (r && r.isla) return islaAltura(x, wz, r);
  return escalaRelieve(wz) > 0 && esTierraEn(x, wz) ? tierraH(x, wz) * escalaRelieve(wz) : 0;
}

// ---------------------------------------------------------------- LA ISLA (G4)
//
// LA BARRERA DE ROCA ALARGADA (§4.1 del plan), con campo arriba. Es un RELIEVE, no un objeto: una
// funcion pura de la posicion que contesta cuantos metros de tierra hay ahi. La leen el vuelo (el
// piso bajo el avion), la siembra y el dibujo — lo que ves es lo que te mata.
//
// EL PERFIL, del agua hacia adentro: arena al pie (`GEO_ISLA_PLAYA`), despues la subida (la
// pendiente de `borde`), y arriba el lomo, que no es una meseta de tiralineas: la cumbre sube y baja
// con el relieve de la turba (`tierraH`). La subida entra en la cumbre SIN QUIEBRE y sin pasarse
// nunca de su pendiente — la promesa de `borde: 'playa'` es que se puede seguir con el gas, y un
// hombro mas empinado que la ladera la romperia justo arriba.

/** Cuantos metros hay desde el punto hasta el borde de la isla (el agua), el menor entre el borde de
 *  adelante/atras y —en una isla parcial— el de los costados. Negativo: afuera, en el agua. Los dos
 *  van por separado porque suben distinto: la entrada es la pendiente de `borde`, el costado que da
 *  al canal es un flanco empinado. */
function islaBorde(x, wz, r) {
  return Math.min(Math.min(wz - r.d0, r.d1 - wz), r.isla.m - Math.abs(x - r.isla.cx));
}

/** La altura de la tierra de una isla en (x, wz). 0 afuera. */
export function islaAltura(x, wz, r) {
  const I = r.isla;
  const sz = Math.min(wz - r.d0, r.d1 - wz);
  const sx = I.m - Math.abs(x - I.cx);
  if (sz < 0 || sx < 0) return 0;
  const cara = I.borde === 'acantilado';
  const pie = cara ? GEO_ISLA_PLAYA * 0.4 : GEO_ISLA_PLAYA;
  // la arena: apenas sobre el agua (el roce ahi es roce de playa, no de agua)
  // (en 4 m: con 3, la rampita de la arena era lo mas empinado de toda la entrada — 0,083)
  const arena = 0.25 * Math.min(1, Math.min(sz, sx) / 4);
  const subeZ = Math.max(0, sz - pie) * (cara ? GEO_ISLA_CARA : GEO_ISLA_PENDIENTE);
  const subeX = Math.max(0, sx - pie * 0.5) * GEO_ISLA_FLANCO;
  const sube = Math.min(subeZ, subeX);
  // LA CUMBRE: el lomo con el relieve de la turba encima (entre 0.8 y 1 de `alto`)
  const tn = TIERRA_AMP > 0 ? tierraH(x, wz) / TIERRA_AMP : 0;   // aprox. -1..1
  const C = I.alto * (0.9 + 0.1 * Math.max(-1, Math.min(1, tn)));
  if (!(C > 0)) return arena;
  // subida lineal hasta el 70% de la cumbre y despues se acuesta (derivada continua, nunca mayor)
  const t = sube / C;
  const f = t < 0.7 ? t : 0.7 + 0.3 * (1 - Math.exp(-(t - 0.7) / 0.3));
  return Math.max(arena, C * f);
}

/** La ISLA que esta a `wz` (o a menos de `margen` metros), o null. La usan la siembra (no plantar
 *  nada encima ni pegado) y el recorte de lo que queda detras. */
export function islaEn(wz, margen) {
  const m = margen || 0;
  for (const r of geo.islas) if (wz >= r.d0 - m && wz < r.d1 + m) return r;
  return null;
}

/** Cuanto de la loma de T3 hay a `wz`, de 0 a lomas/TIERRA_AMP. La usa tambien el sombreado del
 *  raster, que es por fila y no por punto. */
export function escalaRelieve(wz) {
  if (geo.tramos === null) return hayRelieve(cfg) ? 1 : 0;
  const r = tramoEn(wz);
  if (!r || r.suelo !== 'land' || !(TIERRA_AMP > 0)) return 0;
  const L = costura(r, GEO_COSTURA);
  let rampa = 1;
  if (r.prev && r.prev.suelo !== 'land') rampa = Math.min(rampa, suave((wz - r.d0 - GEO_PLAYA) / L));
  if (r.next && r.next.suelo !== 'land') rampa = Math.min(rampa, suave((r.d1 - GEO_PLAYA - wz) / L));
  return (r.lomas / TIERRA_AMP) * rampa;
}
