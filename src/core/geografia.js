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
import { shoreAt, TIERRA_AMP, GEO_COSTURA, GEO_PLAYA, GEO_PLAYA_ONDA, GEO_ORILLA_ENTRA, GEO_ORILLA_LEJOS } from '../data/tuning.js';

/** Los suelos de la data (en castellano, que es como se escribe una mision) y el codigo interno
 *  con el que el juego ya los conocia (`cfg.terrain`). Traducir aca y no en cada lector es lo que
 *  deja intactas las ramas de siempre: el raster sigue preguntando `=== 'land'`. */
export const SUELOS = { mar: 'sea', costa: 'coast', tierra: 'land' };
export const LADOS = ['izq', 'der'];

/** LAS CLAVES QUE HOY HACEN ALGO. Las del plan que todavia no existen (`paredes`, `niebla`,
 *  `barrera`, la `isla`) NO estan, y a proposito: una clave aceptada que no hace nada es la peor
 *  forma de fallar — el mapa se escribe, se valida, y no pasa nada. Cada fase agrega las suyas. */
export const CLAVES = ['hasta', 'suelo', 'lado', 'lomas'];

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
export const geo = { lista: null, obj: 0, tramos: null, sinSiembra: 0 };

/** Carga la geografia de la corrida. La llama systems/geografia.js (`cargar`), que es quien sabe
 *  si hay una sonda pisando la data; el orquestador llama a ESE, al lado de `setFases`, porque es
 *  donde ya se sabe `objectiveDist` y las fracciones sin su objetivo no son nada. */
export function setGeografia(lista, obj) {
  geo.obj = obj > 0 ? obj : 0;
  geo.lista = Array.isArray(lista) && lista.length ? lista : null;
  geo.tramos = geo.lista && geo.obj > 0 ? armar(geo.lista, geo.obj) : null;
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
    });
    d0 = d1;
  }
  for (let i = 0; i < t.length; i++) { t[i].prev = t[i - 1] || null; t[i].next = t[i + 1] || null; }
  return t;
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
  return escalaRelieve(wz) > 0 && esTierraEn(x, wz) ? tierraH(x, wz) * escalaRelieve(wz) : 0;
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
