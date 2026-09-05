// EL PASILLO EN ZIGZAG — el trazado que dobla (docs/sistemas/PLAN_PASILLO_ZIGZAG.md).
//
// EL MODELO ES EL RIEL CURVO (OutRun / After Burner), y entenderlo es entender todo el archivo:
// el carril NO se mueve en x absoluto. El avion sigue viviendo en [-FLY_X, FLY_X], lo que nace
// sigue naciendo en ±SPAWN_X y las colisiones siguen siendo |plane.x - o.x|. Lo unico que dobla
// es lo que la CAMARA VE: a la profundidad z, el carril esta corrido de costado por cuanto giro
// el trazado entre la camara y ese punto. Eso es `bendW(z)`, y es todo lo que este modulo
// exporta hacia el dibujo.
//
// POR QUE ASI y no moviendo el carril de verdad: el avion se mueve de costado a 30 m/s mientras
// avanza a 74-150. Un trazado en x absoluto le exigiria atravesar la curva a esa velocidad
// (pendiente maxima 0,4 en crucero y 0,2 con turbo: curvas larguisimas o imposibles), y ademas
// se veria como DESPLAZARSE DE COSTADO en vez de virar — que es el rechazo que ya se comio la
// primera arena. Ver §1 del plan para la comparacion completa.
//
// ESTE ARCHIVO ES PURO en el sentido del repo: sin DOM, sin canvas, sin cfg, sin stores de otro
// modulo. Solo matematica y un store propio de numeros — por eso lo puede importar
// `npm run unit` y correr en node pelado, igual que core/tramos.js y core/dialogue.js.
// El que decide QUE trazado rige (la mision, el cfg, el estado) es systems/zigzag.js.
//
// ⚠ LA GARANTIA MAS IMPORTANTE DEL ARCHIVO: con el zigzag apagado, `bendW()` devuelve
// EXACTAMENTE 0 (no "casi 0"). Todos los sitios de dibujo suman `+ bendW(z) * k`, o sea `+ 0`,
// y en punto flotante `x + 0` devuelve `x` bit a bit. Esa es la prueba de que un mapa sin
// zigzag se dibuja igual que antes de que este archivo existiera — mas fuerte que cualquier
// captura comparada, y la cuida `npm run unit`.
import { ZZ_CURV_MAX, ZZ_LARGO_MIN, ZZ_EMPALME, ZZ_BEND_Z, ZZ_BEND_PASO,
  ZZ_CENTRIF, ZZ_DERIVA_MAX, ZZ_TILT, ZZ_CAM_LEAD,
  ZZ_PARED_X, ZZ_PARED_H, ZZ_PARED_BANDA,
  ZZ_PUNTA_CADA, ZZ_PUNTA_LARGO, ZZ_PUNTA_MAX, ZZ_PUNTA_P, ZZ_PUNTA_RAMPA } from '../data/tuning.js';

/** Las claves que un `zigzag:` puede traer. Cualquier otra es error de DATOS y el validador la
 *  rechaza, por la misma razon que en los tramos: una clave mal escrita no hace nada y no avisa,
 *  que es la peor forma de fallar. */
export const CLAVES = ['amp', 'largo', 'seed', 'trazado', 'paredes', 'desde', 'hasta'];
export const CLAVES_PARED = ['alto', 'x', 'mata'];

/** hash entero → [0,1). La misma copia de bolsillo que usan core/tierra.js y render/world.js:
 *  este modulo es puro y no puede importar del render. */
function hash1(a) {
  let h = Math.imul(a | 0, 374761393) ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Suavizado 0→1 con derivada nula en las puntas. Lo usan el empalme entre curvas y la ventana
 *  desde/hasta: sin esto, entrar a una curva daria un TIRON del horizonte. */
const suave = t => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

// ---------------------------------------------------------------------------------------------
// EL VALIDADOR
// ---------------------------------------------------------------------------------------------

/** Revisa un `zigzag` y devuelve los ERRORES en texto (lista vacia = data sana).
 *
 *  Devuelve errores en vez de tirar, por el mismo motivo que `validarTramos`: lo llaman dos
 *  cosas distintas — el unit test, que los quiere ver todos juntos para poder decir que mision
 *  esta mal, y la sonda `__zzset`, que los tiene que contestar por consola sin llevarse el
 *  juego puesto.
 *
 *  `undefined` es valido: la enorme mayoria de las misiones no lleva zigzag. */
export function validarZigzag(z) {
  const e = [];
  if (z === undefined || z === null) return e;
  if (typeof z !== 'object' || Array.isArray(z)) return ['`zigzag` tiene que ser un objeto'];

  for (const k of Object.keys(z)) {
    if (CLAVES.indexOf(k) < 0) e.push(`clave desconocida '${k}' (las validas: ${CLAVES.join(', ')})`);
  }

  const tieneProc = z.amp !== undefined || z.largo !== undefined || z.seed !== undefined;
  // LAS DOS FORMAS SON EXCLUYENTES. Aceptar las dos obligaria a decidir cual gana, y esa
  // decision seria invisible desde los datos: la mision se veria bien y volaria otra cosa.
  if (z.trazado !== undefined && tieneProc) e.push('`trazado` y `amp`/`largo`/`seed` son excluyentes: una forma o la otra');
  if (z.trazado === undefined && z.amp === undefined) e.push('falta el trazado: o `amp` (procedural) o `trazado` (explicito)');

  if (z.amp !== undefined && !(typeof z.amp === 'number' && z.amp >= 0 && z.amp <= 1))
    e.push(`'amp' tiene que ser un numero en [0,1] y es ${JSON.stringify(z.amp)}`);
  if (z.largo !== undefined && !(typeof z.largo === 'number' && z.largo >= ZZ_LARGO_MIN))
    e.push(`'largo' tiene que ser un numero >= ${ZZ_LARGO_MIN} m y es ${JSON.stringify(z.largo)}`);
  if (z.seed !== undefined && typeof z.seed !== 'number')
    e.push(`'seed' tiene que ser un numero y es ${JSON.stringify(z.seed)}`);

  if (z.trazado !== undefined) {
    if (!Array.isArray(z.trazado) || !z.trazado.length) e.push('`trazado` tiene que ser una lista no vacia');
    else z.trazado.forEach((t, i) => {
      if (!Array.isArray(t) || t.length !== 2) { e.push(`trazado ${i}: tiene que ser [metros, curvatura]`); return; }
      if (!(typeof t[0] === 'number' && t[0] >= ZZ_LARGO_MIN))
        e.push(`trazado ${i}: los metros tienen que ser >= ${ZZ_LARGO_MIN} y son ${JSON.stringify(t[0])}`);
      if (!(typeof t[1] === 'number' && t[1] >= -1 && t[1] <= 1))
        e.push(`trazado ${i}: la curvatura tiene que estar en [-1,1] y es ${JSON.stringify(t[1])}`);
    });
  }

  // LA VENTANA. Fracciones y no metros, por lo mismo que en los tramos: `?qa` comprime las
  // distancias al 6% y un metro absoluto no sobrevive a eso; una fraccion si.
  for (const k of ['desde', 'hasta']) {
    if (z[k] !== undefined && !(typeof z[k] === 'number' && z[k] >= 0 && z[k] <= 1))
      e.push(`'${k}' tiene que ser una fraccion en [0,1] y es ${JSON.stringify(z[k])}`);
  }
  if (typeof z.desde === 'number' && typeof z.hasta === 'number' && z.desde >= z.hasta)
    e.push(`'desde' (${z.desde}) tiene que ser menor que 'hasta' (${z.hasta})`);

  if (z.paredes !== undefined) {
    const p = z.paredes;
    if (typeof p !== 'object' || Array.isArray(p) || p === null) e.push('`paredes` tiene que ser un objeto');
    else {
      for (const k of Object.keys(p)) {
        if (CLAVES_PARED.indexOf(k) < 0) e.push(`paredes: clave desconocida '${k}' (las validas: ${CLAVES_PARED.join(', ')})`);
      }
      if (p.alto !== undefined && !(typeof p.alto === 'number' && p.alto >= 0 && p.alto <= 1))
        e.push(`paredes: 'alto' tiene que ser un numero en [0,1] y es ${JSON.stringify(p.alto)}`);
      if (p.x !== undefined && !(typeof p.x === 'number' && p.x > 0))
        e.push(`paredes: 'x' tiene que ser un numero > 0 y es ${JSON.stringify(p.x)}`);
      if (p.mata !== undefined && typeof p.mata !== 'boolean')
        e.push(`paredes: 'mata' tiene que ser booleano y es ${JSON.stringify(p.mata)}`);
    }
  }
  return e;
}

// ---------------------------------------------------------------------------------------------
// EL TRAZADO
// ---------------------------------------------------------------------------------------------

/** LA VENTANA: cuanto rige el zigzag a `d` metros, en [0,1].
 *
 *  `desde`/`hasta` son fracciones del objetivo, y el borde NO es un escalon: se funde en
 *  ZZ_EMPALME metros. Ese fundido es lo que hace la BOCA del callejon (el paisaje cerrandose) y
 *  la SALIDA (el mar abriendose antes del climax) sin una linea de codigo por mision.
 *
 *  Sin objetivo —POR LA PATRIA, que es infinito— la ventana es entera: no hay fraccion posible
 *  de una distancia que no termina nunca. */
export function ventana(d, z, objetivo) {
  if (!z) return 0;
  // EL ARRANQUE: antes de esto no hay callejon, haya o no `desde` declarado. Un callejon que ya
  // esta ahi al soltar el freno no es un lugar al que se ENTRA — es el mapa —, y encima le tapa
  // la salida al despegue. Lo pone el sistema (sabe donde termina la base); aca solo se respeta.
  const arr = zz.arranque > 0 ? suave((d - zz.arranque) / ZZ_EMPALME) : 1;
  if (arr <= 0) return 0;
  if (!(objetivo > 0)) return arr;
  const d0 = (typeof z.desde === 'number' ? z.desde : 0) * objetivo;
  const d1 = (typeof z.hasta === 'number' ? z.hasta : 1) * objetivo;
  // EL EMPALME SE TOPA CONTRA EL ANCHO DE LA VENTANA, y esto no es una precaucion teorica: lo
  // encontro el unit test. `?qa` comprime las misiones al 6%, asi que la ventana del callejon de
  // m5 (0.35 a 0.90 de 2600 m) pasa de 1430 m a 86 — menos que los 120 m del empalme. Sin el
  // tope, las dos rampas se pisan, la ventana no llega nunca a 1 y el zigzag simplemente NO
  // APARECE en `?qa`: una prueba que corre y no prueba nada. Con el tope, el trazado se
  // comprime junto con la mision en vez de desaparecer.
  const emp = Math.max(1, Math.min(ZZ_EMPALME, (d1 - d0) * 0.35));
  return arr * suave((d - d0) / emp) * suave((d1 - d) / emp);
}

/** La curvatura NORMALIZADA en [-1,1] a `d` metros, sin la ventana y sin ZZ_CURV_MAX.
 *  Positiva = el camino dobla a la DERECHA. */
export function curvNorm(d, z) {
  if (!z) return 0;
  if (z.trazado) return trazadoAt(d, z.trazado);
  // PROCEDURAL: dos senos de largo distinto, el idioma del repo (shoreAt son tres, tierraH dos).
  // Uno solo daria un zigzag de metronomo — se aprende de memoria en dos curvas y deja de ser
  // un camino para ser un patron. Las dos fases salen de la semilla, asi que la misma mision
  // dobla SIEMPRE igual: un trazado que cambia entre intentos no se puede aprender ni probar.
  const largo = z.largo || 600;
  const seed = z.seed || 0;
  const ph1 = hash1(seed * 7 + 11) * 6.283, ph2 = hash1(seed * 13 + 101) * 6.283;
  const L1 = largo / Math.PI, L2 = largo * 0.41 / Math.PI;
  const a = 0.78 * Math.sin(d / L1 + ph1) + 0.22 * Math.sin(d / L2 + ph2);
  return Math.max(-1, Math.min(1, a)) * (z.amp === undefined ? 1 : z.amp);
}

/** Trazado EXPLICITO: la lista `[[metros, curvatura], ...]` leida a `d` metros, con los saltos
 *  entre tramos empalmados en ZZ_EMPALME. Pasado el final, RECTA (curvatura 0) — que es
 *  justamente la salida del callejon a la bahia. */
function trazadoAt(d, tr) {
  if (d < 0) return tr[0][1];
  let acc = 0;
  for (let i = 0; i < tr.length; i++) {
    const largo = tr[i][0];
    if (d < acc + largo) {
      const v = tr[i][1];
      // el empalme se hace SOLO al entrar al tramo, mezclando con el valor del tramo anterior.
      // Hacerlo tambien al salir mezclaria dos veces la misma frontera.
      const prev = i > 0 ? tr[i - 1][1] : 0;
      return prev + (v - prev) * suave((d - acc) / ZZ_EMPALME);
    }
    acc += largo;
  }
  // despues del ultimo tramo: se endereza con el mismo empalme
  const ult = tr[tr.length - 1][1];
  return ult + (0 - ult) * suave((d - acc) / ZZ_EMPALME);
}

/** LA CURVATURA REAL en rad/m a `d` metros: normalizada × ventana × ZZ_CURV_MAX. */
export function curvAt(d, z, objetivo) {
  if (!z) return 0;
  return curvNorm(d, z) * ventana(d, z, objetivo) * ZZ_CURV_MAX;
}

// ---------------------------------------------------------------------------------------------
// EL STORE Y LA TABLA
// ---------------------------------------------------------------------------------------------

/** El estado VIVO del zigzag. Identidad estable (se muta, nunca se reasigna) como el resto de
 *  los stores del repo — lo custodia `npm run lint:state`.
 *
 *  `bend[i]` es el corrimiento lateral, en unidades de MUNDO, del carril a la profundidad
 *  `i * ZZ_BEND_PASO` vista desde `d0`. La tabla se rehace una vez por cuadro (101 muestras:
 *  nada) en vez de resolverse por punto, porque el mar y la tierra se dibujan por filas de
 *  miles de puntos y ahi adentro no puede haber ni una raiz cuadrada de mas. */
export const zz = {
  on: false,        // ¿hay trazado corriendo? Con `false`, bendW() devuelve EXACTAMENTE 0
  spec: null,       // el `zigzag:` vigente (de la mision o del cfg)
  d0: 0,            // donde esta la camara sobre el trazado, en metros
  obj: 0,           // objectiveDist, para resolver la ventana desde/hasta
  curv: 0,          // curvatura AQUI (rad/m). La lee la deriva y el tilt
  curvN: 0,         // la misma, normalizada [-1,1]: la lee el tilt y la mirada al apice
  head: 0,          // rumbo acumulado desde el arranque (rad). Lo lee el fondo
  n: 0,             // muestras validas de la tabla
  bend: [],         // la tabla, en unidades de mundo
  // ANTES DE ESTOS METROS no hay callejon. Lo escribe systems/zigzag.js, que es el unico que sabe
  // donde termina la pista y si la mision arranca en el aire.
  arranque: 0,
};

const N_TABLA = Math.floor(ZZ_BEND_Z / ZZ_BEND_PASO) + 1;

/** APAGA el zigzag. Es lo que hace que todo lo demas sea un no-op, y por eso es una funcion
 *  propia y no un `zz.on = false` suelto por ahi: apagar tiene que dejar el store entero en
 *  cero, no solo el interruptor (si `curv` quedara con el ultimo valor, la deriva seguiria
 *  empujando en el clímax). */
export function apagar() {
  zz.on = false; zz.spec = null; zz.curv = 0; zz.curvN = 0; zz.n = 0;
  // `head` NO se resetea aca: el rumbo es del RECORRIDO, y apagar el zigzag al entrar al climax
  // no deshace lo que el avion ya giro. Lo resetea `reset()`, que es cuando empieza otra corrida.
  return zz;
}

/** Arranca de cero: otra corrida, otro trazado. */
export function reset() { apagar(); zz.d0 = 0; zz.obj = 0; zz.head = 0; zz.arranque = 0; return zz; }

/** Rehace la tabla para la posicion `d0`. Se llama UNA vez por cuadro.
 *
 *  LA CUENTA, que es la unica del archivo que vale la pena leer despacio: si `θ(d)` es el rumbo
 *  del camino, un punto a `s` metros por delante de la camara esta desviado de la linea de
 *  vision por la integral del rumbo RELATIVO acumulado:
 *
 *      bend(z) = ∫₀ᶻ ( θ(d0+s) − θ(d0) ) ds
 *
 *  (aproximacion de angulo chico: sin θ ≈ θ. Con la curvatura maxima del juego, a 400 m el
 *  rumbo relativo llega a 0,67 rad y el error del seno es del 7% — invisible, y ademas el
 *  trazado es una decision de diseño, no una medicion de un camino real.)
 *
 *  Se integra con Euler en pasos de ZZ_BEND_PASO metros porque es exacto de sobra para una
 *  curva de radio 600: el paso es el 0,7% del radio. */
export function rebuild(d0, spec, objetivo, arranque) {
  zz.arranque = arranque > 0 ? arranque : 0;
  zz.spec = spec || null;
  zz.d0 = d0;
  zz.obj = objetivo > 0 ? objetivo : 0;
  zz.on = !!spec;
  if (!zz.on) { zz.curv = 0; zz.curvN = 0; zz.n = 0; return zz; }

  zz.curv = curvAt(d0, spec, zz.obj);
  zz.curvN = curvNorm(d0, spec) * ventana(d0, spec, zz.obj);

  const paso = ZZ_BEND_PASO;
  let head = 0, bend = 0;
  for (let i = 0; i < N_TABLA; i++) {
    zz.bend[i] = bend;
    head += curvAt(d0 + i * paso, spec, zz.obj) * paso;   // rumbo RELATIVO: arranca en 0
    bend += head * paso;
  }
  zz.n = N_TABLA;
  return zz;
}

/** Avanza el rumbo acumulado del recorrido. Va aparte de `rebuild` porque necesita el `dt`
 *  (o mejor, los metros volados): es lo unico del modulo que INTEGRA en el tiempo, y es lo
 *  que hace que el telon y las sierras del fondo se corran al doblar. */
export function avanzar(metros) {
  if (zz.on) zz.head += zz.curv * metros;
  return zz.head;
}

/** EL CORRIMIENTO LATERAL del carril a la profundidad `camZ`, en unidades de MUNDO.
 *
 *  Quien dibuja hace `W/2 + (wx - cam.x + bendW(camZ)) * k`, o —en los bucles por fila, donde
 *  `camZ` es constante— iza `bendW(camZ) * k` fuera del bucle y suma esos pixeles.
 *
 *  ⚠ CON EL ZIGZAG APAGADO DEVUELVE EXACTAMENTE 0, y de eso depende la promesa entera del
 *  item: `x + 0` es `x` bit a bit, asi que un mapa sin zigzag se dibuja igual que siempre. */
export function bendW(camZ) {
  if (!zz.on) return 0;
  if (!(camZ > 0)) return 0;
  const p = camZ / ZZ_BEND_PASO;
  const i = p | 0;
  if (i >= zz.n - 1) return zz.bend[zz.n - 1];
  const f = p - i;
  return zz.bend[i] + (zz.bend[i + 1] - zz.bend[i]) * f;
}

/** LA DERIVA de la curva, en m/s, positiva hacia +x.
 *
 *  Es la fuerza que hace que doblar sea una HABILIDAD y no una animacion: en la curva el avion
 *  se va hacia AFUERA y hay que sostener la palanca hacia adentro. El signo es negativo respecto
 *  de la curvatura porque afuera es el lado contrario al que dobla el camino (curva a la
 *  derecha → te tira a la izquierda), que es la centrifuga de toda la vida.
 *
 *  Va topada: sin tope, entrar con turbo a la curva cerrada daria 37 m/s contra los 30 de la
 *  palanca y la curva seria una muerte sin salida en vez de un riesgo. */
export function deriva(spd) {
  if (!zz.on) return 0;
  const d = -zz.curv * spd * ZZ_CENTRIF;
  return Math.max(-ZZ_DERIVA_MAX, Math.min(ZZ_DERIVA_MAX, d));
}

/** Cuanto INCLINA la curva el horizonte, en radianes. Cero sin zigzag.
 *
 *  Vive aca —y no en systems/— porque lo consume core/horizon.js, y core no puede importar
 *  systems. El signo sigue a la curvatura: doblando a la derecha el mundo se inclina igual que
 *  cuando se banquea a la derecha, que es lo que hace que la curva se lea como un viraje y no
 *  como un mundo que se tuerce solo.
 *
 *  QUIEN DECIDE SI SE APLICA es core/horizon.js, no esto: con el horizonte en FIJO no se inclina
 *  nada, y esa salida —la del que se marea— la respeta tambien el zigzag. */
export const tilt = () => (zz.on ? zz.curvN * ZZ_TILT : 0);

/** Cuanto ADELANTA la camara la mirada hacia el apice, en unidades de mundo. Cero sin zigzag.
 *  Sin esto la curva se descubre tarde: la camara mira derecho mientras el camino ya doblo. */
export const lead = () => (zz.on ? zz.curvN * ZZ_CAM_LEAD : 0);

// ---------------------------------------------------------------------------------------------
// LAS PAREDES DEL CALLEJON (Z3)
// ---------------------------------------------------------------------------------------------
//
// POR QUE ESTAN, y no es "para que se vea lindo": el playtest de Z2 encontro que el carril curvo
// SOLO —sobre mar abierto, plano, sin nada a los costados— MAREA. El mundo se inclina y el avion
// se corre, y el ojo no tiene contra que explicarlo. Las laderas son el marco de referencia que
// vuelve legible el viraje. Y de paso son la consecuencia: seguis el camino o chocas.
//
// Viven en el MARCO DEL CARRIL como todo lo demas — se dibujan a ±x y doblan en pantalla con el
// mismo `bendW(z)` que el mundo. La altura es una FUNCION PURA de la posicion, igual que
// `tierraH` en core/tierra.js, y por la misma razon: la colision tiene que evaluar exactamente la
// misma superficie que se dibuja. Lo que ves es lo que te mata, tambien de este lado.

/** La config de paredes vigente, o null si el trazado no las declara. */
export function pared() {
  const p = zz.on && zz.spec && zz.spec.paredes;
  if (!p) return null;
  return {
    x: typeof p.x === 'number' ? p.x : ZZ_PARED_X,
    alto: typeof p.alto === 'number' ? p.alto : 1,
    mata: p.mata !== false,
  };
}

/** ALTURA DE LA LADERA en metros a la profundidad de mundo `wz`, del lado `lado` (-1 izquierda,
 *  +1 derecha). 0 si no hay paredes ahi.
 *
 *  DOS ESCALAS, como el relieve de la turba: una banda larga que da los cerros (interpolada
 *  suave entre bandas, para que la cresta suba y baje en vez de escalonarse) y un detalle corto
 *  que le pone el filo. Determinista por posicion de mundo: la ladera no titila ni se muda, y
 *  dos corridas de la misma mision ven exactamente el mismo cerro.
 *
 *  SE MULTIPLICA POR LA VENTANA, y eso es lo que hace la BOCA y la SALIDA del callejon sin una
 *  linea de codigo por mision: donde el trazado todavia no rige, la pared mide cero y el paisaje
 *  esta abierto; entra con el mismo fundido con el que entra la curva. */
export function paredH(wz, lado) {
  const p = pared();
  if (!p) return 0;
  const v = ventana(wz, zz.spec, zz.obj);
  if (v <= 0) return 0;
  const sd = lado > 0 ? 7717 : 1259;
  // TRES ESCALAS, y la mas larga es la que cambia todo. Con solo las dos cortas los cerros
  // quedaban todos entre 12 y 29 m: variaban, pero como se ven quince bandas a la vez el ojo
  // promedia y la sierra se lee PAREJA. El MACIZO —una onda de ~220 m— hace que haya tramos de
  // lomas bajas y despues una mole: eso es lo que se lee como paisaje irregular y no como una
  // pared con dientes.
  const B2 = ZZ_PARED_BANDA * 4;
  const b2 = Math.floor(wz / B2), u2 = wz / B2 - b2;
  const m0 = hash1(b2 * 17 + sd + 101), m1 = hash1((b2 + 1) * 17 + sd + 101);
  const macizo = 0.5 + (m0 + (m1 - m0) * suave(u2)) * 0.85;   // 0.50 .. 1.35
  const b = Math.floor(wz / ZZ_PARED_BANDA);
  const u = wz / ZZ_PARED_BANDA - b;
  const a = hash1(b * 31 + sd), c = hash1((b + 1) * 31 + sd);
  const cerro = a + (c - a) * suave(u);                       // la loma, continua entre bandas
  const filo = (hash1(Math.floor(wz / 7) * 13 + sd) - 0.5) * 0.22;   // el detalle que la quiebra
  return ZZ_PARED_H * p.alto * v * macizo * Math.max(0.3, 0.72 + cerro * 0.4 + filo);
}

/** ¿ESTE PUNTO ESTA ADENTRO DE LA ROCA? `x` en el marco del carril, `y` en metros, `wz` la
 *  profundidad de mundo. Es LA fuente para el dibujo y para la colision — un overlay que copie
 *  el numero a mano es peor que no tenerlo.
 *
 *  El PIE de la ladera cobra antes que la cara (`talud`): la roca no es un vidrio vertical, y sin
 *  el margen el jugador muere contra una linea invisible que esta detras de lo que ve. */
export function enPared(x, y, wz, talud, libre) {
  const p = pared();
  if (!p) return 0;
  const lado = x >= 0 ? 1 : -1;
  const borde = paredXAt(wz, lado) - (talud || 0);
  if (Math.abs(x) < borde) return 0;
  const h = paredH(wz, lado);
  if (h <= 0) return 0;
  return y < h * (libre || 1) ? lado : 0;   // por encima de la cresta se pasa
}

/** EL CARRIL SEGURO entre `d0` y `d0 + alcance` metros: `{ lo, hi }`, el intervalo de `x` que
 *  esta libre a lo largo de TODO ese tramo. Lo usa el sembrador.
 *
 *  Por que el tramo entero y no el hueco de este metro: un obstaculo nace a 320 m y VIAJA hasta el
 *  avion. Sembrarlo en un hueco que se cierra 100 m mas adelante lo deja adentro de la roca —
 *  invisible y letal, la peor combinacion que hay. Mirando el tramo entero, el obstaculo nace
 *  donde va a seguir estando libre cuando llegue.
 *
 *  ⚠ DEVUELVE UN INTERVALO ABSOLUTO Y PUEDE NO CONTENER AL CERO, y eso no es un detalle: desde que
 *  las puntas grandes CRUZAN el eje del pasillo (una punta de 66 sobre un borde de 46 pone la
 *  pared izquierda en x = +20), el unico lugar seguro puede estar todo de un lado. La version
 *  anterior devolvia dos semi-anchos y los topaba en 4, con lo cual en ese caso decia "sembra
 *  cerca del centro" — o sea, adentro de la roca. Es el bug que este comentario existe para que no
 *  vuelva.
 *
 *  Si `hi <= lo` no hay lugar: el sembrador saltea el ciclo en vez de forzar un carril. */
export function carrilSeguro(d0, alcance, talud) {
  const p = pared();
  if (!p) return null;
  let lo = -p.x, hi = p.x;
  // 12 m de paso: las puntas miden ZZ_PUNTA_LARGO (70), asi que ninguna se escapa entre muestras
  for (let d = d0; d <= d0 + alcance; d += 12) {
    const bordeIzq = -paredXAt(d, -1);          // la cara interna de la pared izquierda, en x
    const bordeDer = paredXAt(d, 1);
    if (bordeIzq > lo) lo = bordeIzq;
    if (bordeDer < hi) hi = bordeDer;
  }
  const m = (talud || 0) + 2;
  return { lo: lo + m, hi: hi - m };
}

/** CUANTO SE METE LA TIERRA en el pasillo a la profundidad `wz`, del lado `lado`.
 *
 *  Es EL corazon del callejon. Cada banda de ZZ_PUNTA_CADA metros sortea si trae punta y —lo que
 *  garantiza que siempre se pueda pasar— DE QUE LADO: una sola, de un solo lado. El callejon no
 *  se puede cerrar ni tocando los numeros, porque no hay ningun numero que lo cierre.
 *
 *  El perfil es una campana suave (seno al cuadrado) y no un escalon: un promontorio entra y sale,
 *  se ve venir de lejos y se rodea. Un escalon seria una pared cruzada, que es otra cosa. */
export function paredEntra(wz, lado) {
  const p = pared();
  if (!p) return 0;
  const b = Math.floor(wz / ZZ_PUNTA_CADA);
  if (hash1(b * 7919 + 13) > ZZ_PUNTA_P) return 0;              // esta banda no trae punta
  // DE QUE LADO. Una sola punta por banda: si el sorteo la puso a la izquierda, la derecha esta
  // limpia, y viceversa. Aca vive la garantia de paso.
  const suLado = hash1(b * 4241 + 77) < 0.5 ? -1 : 1;
  if (suLado !== lado) return 0;
  // DONDE arranca dentro de su banda, y cuanto se mete (no todas llegan al maximo)
  const off = hash1(b * 331 + 5) * (ZZ_PUNTA_CADA - ZZ_PUNTA_LARGO);
  const u = (wz - b * ZZ_PUNTA_CADA - off) / ZZ_PUNTA_LARGO;
  if (u <= 0 || u >= 1) return 0;
  const perfil = Math.sin(u * Math.PI);                          // entra y sale suave
  // TRES TAMAÑOS, sorteados por banda. Un callejon donde todas las puntas miden lo mismo se
  // aprende en dos y deja de ser un callejon para ser un metronomo. Con esta mezcla hay respiro,
  // hay trabajo normal, y de vez en cuando aparece una que ocupa CASI TODO el pasillo y obliga a
  // cruzar al otro extremo — que es lo que el autor pidio ver.
  const hh = hash1(b * 613 + 29);
  const hondo = hh < 0.22 ? 0.28 + hh * 0.9                      // respiro: se rodea sin drama
    : hh < 0.78 ? 0.52 + (hh - 0.22) * 0.55                      // lo normal
      : 0.90 + (hh - 0.78) * 0.45;                               // las grandes: cruzar entero
  // LA ESCALADA. El callejon se pone mas dificil a medida que se avanza: arranca al 55% y llega a
  // pleno en ZZ_PUNTA_RAMPA metros. Se mide desde donde EMPIEZA el callejon (la fraccion `desde`
  // de la mision) y no desde el despegue, asi la rampa es la del callejon y no la del vuelo.
  const d0 = zz.spec && typeof zz.spec.desde === 'number' && zz.obj > 0 ? zz.spec.desde * zz.obj : 0;
  const esc = Math.min(1, 0.55 + Math.max(0, wz - d0) / ZZ_PUNTA_RAMPA * 0.45);
  return ZZ_PUNTA_MAX * p.alto * hondo * esc * perfil * perfil * ventana(wz, zz.spec, zz.obj);
}

/** TOPA una `x` contra el hueco libre del callejon a la profundidad `wz`.
 *
 *  Existe por LOS QUE SE MUEVEN. Un obstaculo puede nacer en un carril perfectamente seguro y
 *  despues meterse solo en la roca: el globo cabecea alrededor de su ancla, el helicoptero
 *  patrulla, el caza busca tu carril. Medido con el censo del fixture: 21 globos enterrados en una
 *  corrida. Sembrar bien no alcanza — hay que sostenerlo cuadro a cuadro.
 *
 *  Devuelve la `x` tal cual si no hay paredes: el que llama ni se entera de que esto existe. */
export function topeCarril(x, wz, talud) {
  const p = pared();
  if (!p) return x;
  const m = (talud || 0) + 1;
  const lo = -paredXAt(wz, -1) + m, hi = paredXAt(wz, 1) - m;
  if (hi <= lo) return (lo + hi) / 2;          // el hueco se cerro: al medio del cierre, y a otra cosa
  return x < lo ? lo : x > hi ? hi : x;
}

/** LA POSICION DE LA PARED a esa profundidad: el borde base menos lo que se mete la punta.
 *  La leen el dibujo y la colision — una sola fuente, como manda el repo. */
export function paredXAt(wz, lado) {
  const p = pared();
  if (!p) return 0;
  return p.x - paredEntra(wz, lado);
}
