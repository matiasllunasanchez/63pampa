// EL BANCO DEL PICHON (GUION_2 §2c): las mejoras de campaña son una persona. Datos puros.
//
// Cada mejora desbloquea UNA pirueta de data/moves.js — en campaña los combos no aprendidos
// no disparan (gate en el dispatcher de game.js); en los demas modos rige cfg.moves como
// siempre. El TONEL clasico no esta aca: viene puesto de fabrica ("ya la trae puesta: es lo
// primero que le muestra a Esteban").
//
// El orden es el orden CAUSAL del guion: cada maniobra la inventa el Pichon para resolver
// el problema que la escuadrilla acaba de sufrir. Entre mision y mision se OFRECEN las primeras
// no aprendidas y se elige UNA (roguelike-lite): las no elegidas quedan esperando. CUANTAS se
// ofrecen y desde cuando se puede elegir lo dice `ofertaTrasMision`, mas abajo — el tutorial no
// entrega nada y la segunda mision sirve una sin elegir. Con 10 ventanas y 12 mejoras, DOS quedan
// sin aprender por partida.
//
// A partir de M8 (muerto el Pichon) la pantalla cambia de nombre: las mejoras salen de su
// libreta y las construye el Turco solo. Eso lo decide game.js por el indice de mision;
// aca no hay estado.
//
//   id    → clave de MOVES (data/moves.js)
//   name  → nombre en pantalla (sin acentos: es UI)
//   seq   → el combo, como se teclea (para la tarjeta)
//   desc  → que hace, en una linea
//   quote → la voz de la dupla (Pichon vivo) o de la libreta (M8+)
import { DESDE_BRP } from './bombas.js';

export const UPGRADES = [
  { id: 'mask', name: 'TERRAIN MASKING', seq: 'abajo abajo-abajo', desc: 'Clava el avion a ras: congela el roce y descarga el radar', quote: 'Si abajo no nos ven... por que subimos?' },
  { id: 'splits', name: 'SPLIT-S', seq: 'arriba abajo abajo (alto)', desc: 'Medio tonel y picada: la salida vertical hacia abajo', quote: 'Necesitaba una forma de irse para abajo YA.' },
  { id: 'breakt', name: 'BREAK TURN', seq: 'abajo izq izq / abajo der der', desc: 'Viraje quebrado: tiron lateral violento', quote: 'La escolta casi nos engancha de costado.' },
  { id: 'loyo', name: 'LOW YO-YO', seq: 'abajo arriba abajo', desc: 'Pica y remonta: altura convertida en velocidad', quote: 'Salir vivo es cuestion de nudos.' },
  { id: 'sturn', name: 'S-TURN', seq: 'izq der izq', desc: 'Barrido en S: esquiva sin perder el carril', quote: 'Abrirse y volver, como al costado del arco.' },
  { id: 'popup', name: 'POP-UP', seq: 'abajo arriba arriba (bajo)', desc: 'Trepada brusca de ataque desde rasante', quote: 'Nunca mas sin poder mirar hacia arriba.' },
  { id: 'hiyo', name: 'HIGH YO-YO', seq: 'arriba abajo arriba', desc: 'Sube, cuelga y recae: esquive vertical', quote: 'Colgarse arriba y dejar que pase de largo.' },
  { id: 'jink', name: 'JINK', seq: 'arriba izq der', desc: 'Zigzag de esquive: 4 quiebres impredecibles', quote: 'Copie como vuela usted cuando esta desesperado, Tero.' },
  { id: 'spin', name: 'TIRABUZON', seq: 'picar + rolar (der) izq izq', desc: 'Rola sobre su eje picando', quote: 'La dejo a medio explicar. El Turco la termino esa noche.' },
  { id: 'climb', name: 'ASCENSO', seq: 'mirar arriba + arriba arriba', desc: 'Trepa hasta el techo del radar y lo sostiene', quote: 'Pagina 14 de la libreta.' },
  { id: 'climbmax', name: 'SOBRE EL RADAR', seq: 'igual, ya contra el radar', desc: 'Cruza el techo: expuesto, pero llegas', quote: 'Peligroso, pero si hay que llegar a algun lado...' },
  { id: 'barrel', name: 'TONEL BARRIL', seq: 'rolar: abajo der arriba izq', desc: 'La O grande: vuelve al punto exacto', quote: 'Para cuando haya que volver a buscar a alguien.' },
];

/** LAS CHAFITAS (8/10/2026) — las primeras mejoras del banco que NO son piruetas, y por eso viven
 *  fuera de UPGRADES (que son claves de data/moves.js y las leen moveAllowed, el pulso y los
 *  interruptores de OPCIONES). CUATRO CARTAS, una carga cada una (decision del autor, 8/10: "mejorable
 *  de 1 a 4 max", "4 cartas, 1 carga c/u"): la primera, CHAFITAS, se ofrece desde M3 «El invento»;
 *  las otras tres, MAS CHAFITAS, piden la anterior. En campaña las cargas del avion son las cartas
 *  que se tienen (`chafitasDe`); fuera de ella, CHAPITAS.CARGAS (docs/sistemas/SPEC_CHAPITAS.md).
 *
 *  El texto, del autor: "en el guion o descripcion le vamos a indicar que se llaman chaff segun los
 *  estadounidenses, pero el Pichon les va a poner chafitas porque son chapitas pero mas finitas" —
 *  literal, menos "una tecnica inventada por ellos": el chaff lo desarrollaron a la vez los britanicos
 *  (Window) y los alemanes (Düppel); los estadounidenses le pusieron el nombre (PREGUNTAS_HISTORICAS).
 *  Regla de atribucion (MEJORAS_PICHON.md): el Pichon no dice que invento nada. */
const chafita = (k, name, desc, quote, requiere) => ({ id: 'chafitas' + k, chafitas: k, name, tecla: 'H / circulo', desc, quote, requiere });
export const CHAFITAS = [
  chafita(1, 'CHAFITAS',
    'Una carga: el aluminio desvia los misiles de radar; la bengala, los de calor',
    'Chaff le dicen los yanquis. Yo les digo chafitas: son chapitas, pero mas finitas.'),
  chafita(2, 'MAS CHAFITAS', 'Otro cartucho de chafitas: dos cargas por avion', 'La maquina de tallarines no para.', 'chafitas1'),
  chafita(3, 'MAS CHAFITAS', 'Otro cartucho: tres cargas por avion', 'Le dimos a la manivela toda la noche.', 'chafitas2'),
  chafita(4, 'MAS CHAFITAS', 'El ultimo cartucho: cuatro cargas por avion, el maximo', 'Cuatro. Mas no entran.', 'chafitas3'),
];

/** LA METRALLA Y SU CINTA (9/10/2026) — dos escaleras de mejoras del cañon, con el mismo molde que las
 *  chafitas (cartas fuera de UPGRADES, cada una pide la anterior). El autor: "3 mejoras diferentes de
 *  balas relacionadas a la rapidez de disparo [...] dejar el basico al inicio" y "otras 3 mejoras seran
 *  la CANTIDAD/CAPACIDAD de balas, lo que permitira mantener mas tiempo los disparos".
 *
 *  METRALLA: la COMUN viene de fabrica (nivel 1); las cartas dan la de PLATA (2) y la de ORO (3).
 *  Cadencia, sonido, fogonazo y reloj de cada una: METRALLAS en data/tuning.js.
 *  CINTA: la de fabrica (1) y dos cartas que la alargan — cuanto aguanta la rafaga: CINTAS en tuning.
 *  En campaña el nivel son las cartas que se tienen (`metrallaDe`, `cintaDe`); fuera de ella, la COMUN
 *  con la cinta corta (decision del autor, ver game.js). */
const arma = (id, nivel, campo, name, desc, quote, requiere) => ({ id, [campo]: nivel, name, tecla: 'X / ESPACIO', desc, quote, requiere });
export const METRALLA = [
  arma('metralla2', 2, 'metralla', 'METRALLA DE PLATA', 'El doble de tiros por segundo', 'Le cambie los resortes del cerrojo. Ahora escupe.'),
  arma('metralla3', 3, 'metralla', 'METRALLA DE ORO', 'Tres veces y media mas rapida, pero tarda un segundo en girar',
    'Seis caños que giran. Dale un segundo, que despues no para.', 'metralla2'),
];
export const CINTA = [
  arma('cinta2', 2, 'cinta', 'CINTA LARGA', 'La rafaga aguanta una vez y media antes de recalentar', 'Le alargue la cinta. Apretala mas tiempo.'),
  arma('cinta3', 3, 'cinta', 'CINTA ENTERA', 'El doble de rafaga antes de recalentar', 'Toda la cinta que entra en el ala.', 'cinta2'),
];
/** LA BRP-250 (10/10/2026, el autor: "deberia ser otra mejora del Pichon") — la bomba española con la
 *  espoleta rehecha (data/bombas.js; es «Doce segundos», §3 de docs/historia/MEJORAS_PICHON.md), que en
 *  campaña deja de llegar sola por la fecha y pasa a ser una carta del banco: sin ella se vuela con la
 *  MK-17, la que casi no detona. Una sola carta: la bomba se cambia una vez y queda.
 *  TIENE FECHA (MEJORAS_PICHON §3: "no puede aparecer antes de fines de mayo, o sea no antes de M7"):
 *  `desde` es la primera ventana que la ofrece — la de despues de M6, y se vuela desde M7.
 *  Y TIENE PRECIO (la regla de diseño del banco): pesa la mitad que la MK-17 — un golpe en el extremo
 *  rompe la mitad y la explosion abarca menos (`dano`, `radio`, `boquete` en data/bombas.js).
 *  Fuera de campaña manda `bombaDe` (data/bombas.js). */
export const BOMBA_BRP = { id: 'brp', bomba: 'brp', name: 'BRP-250', tecla: 'Z / L1', desde: DESDE_BRP - 1,
  desc: 'Explota casi siempre. Pero pesa la mitad: en el extremo rompe menos',
  quote: 'Le rehicieron la espoleta. La que pega, ahora revienta.' };
const tiene = (owned, id) => !!owned && (owned.includes ? owned.includes(id) : owned.has(id));
/** LAS CARTAS DE CARGA QUE SE PUEDEN APAGAR (10/10, el autor: "configuraciones para los aviones,
 *  definidas por mejoras del Pichon, activables o no"): OPCIONES → MEJORAS DEL PICHON les pone el mismo
 *  interruptor que a las piruetas (`cfg.movesOff`, la clave presente = apagada). La BRP es la primera. */
export const APAGABLES = [BOMBA_BRP];
/** La bomba que da la libreta `owned` en campaña: la BRP si se gano la carta y no esta apagada en
 *  `off` (cfg.movesOff); si no, la MK-17. */
export const bombaDeLibreta = (owned, off) => (tiene(owned, BOMBA_BRP.id) && !(off && off[BOMBA_BRP.id]) ? 'brp' : 'mk17');
/** El nivel de METRALLA (1 comun, 2 plata, 3 oro) que da la libreta `owned`. */
export const metrallaDe = owned => 1 + METRALLA.filter(c => tiene(owned, c.id)).length;
/** El nivel de CINTA (1 a 3) que da la libreta `owned`. */
export const cintaDe = owned => 1 + CINTA.filter(c => tiene(owned, c.id)).length;

/** EL BANCO: el ORDEN en que se entregan las mejoras, piruetas y chafitas juntas. Es el orden causal
 *  de UPGRADES con las cuatro cartas intercaladas: la primera, CHAFITAS, justo despues de la que
 *  sirve M2 —asi la oferta de M3 «El invento» es CHAFITAS contra el SPLIT-S, y si no se elige queda
 *  esperando en la proxima—; MAS CHAFITAS mas adelante, repartidas.
 *  ⚠ CON ESTO SOBRAN CARTAS: 16 para 12 ventanas, y quedan CUATRO sin aprender por partida (antes se
 *  aprendian todas). Es buscado: elegir pesa de verdad. */
//  ⚠ Y CON LA METRALLA Y LA CINTA (9/10) son 20 para 12: quedan OCHO sin aprender. La PLATA llega
//  temprano (tras el SPLIT-S), la CINTA LARGA a mitad, y el ORO y la CINTA ENTERA en la segunda mitad.
//  …Y LA BRP (10/10) va QUINTA: con el loadout de referencia se la tiene entrando a M7, que es donde
//  antes llegaba por la fecha (DESDE_BRP). Saltearla deja la MK-17 — y la carta sigue esperando.
const ORDEN = ['mask', 'chafitas1', 'splits', 'metralla2', 'brp', 'breakt', 'loyo', 'cinta2', 'chafitas2', 'sturn', 'popup',
  'hiyo', 'metralla3', 'chafitas3', 'jink', 'spin', 'cinta3', 'climb', 'chafitas4', 'climbmax', 'barrel'];
const CARTAS = [...UPGRADES, ...CHAFITAS, ...METRALLA, ...CINTA, BOMBA_BRP];
export const BANCO = ORDEN.map(id => CARTAS.find(u => u.id === id));

/** Cuantas cargas de chafitas da la libreta `owned` (las cartas de chafitas que tiene). */
export const chafitasDe = owned => CHAFITAS.filter(c => (owned && owned.includes ? owned.includes(c.id) : owned && owned.has && owned.has(c.id))).length;

/** ¿Puede SALIR esta pirueta? Son dos preguntas distintas que se responden juntas porque quien
 *  juega las vive como una sola: TENERLA (en campaña se gana una por mision) y QUERERLA (MEJORAS
 *  DEL PICHON las prende y las apaga desde el menu). Fuera de campaña se tienen todas.
 *
 *  Vive aca y no en game.js para poder probarla: es la unica regla del banco que, si se rompe,
 *  no da error ni se ve — simplemente una pirueta deja de salir y parece que el combo no anda.
 *
 *  `off` es un objeto usado como conjunto (cfg.movesOff): la clave presente = apagada. */
export function moveAllowed(id, { campaign, owned, off }) {
  if (off && off[id]) return false;              // apagada a mano: no sale nunca, la tengas o no
  if (!campaign) return true;
  return !!owned && (owned.includes ? owned.includes(id) : owned.has(id));
}

// ---------- CUANDO SE ENTREGA UNA MEJORA, Y SI SE ELIGE ----------
// LA RAMPA DE ENTRADA (pedido de Matias, 23/8). Antes el banco se abria en el epilogo de TODAS
// las misiones y siempre con dos cartas: o sea que la primera decision del juego —cual de dos
// piruetas aprender— caia justo despues del TUTORIAL, cuando el jugador todavia no sabe que es
// una pirueta ni para que sirve ninguna de las dos. Elegir sin entender no es elegir: es apretar.
//
// Ahora la campaña ENSEÑA el mecanismo antes de pedir que se use:
//
//   m1 (tutorial) → NADA.  El avion de fabrica y nada mas. Que el tutorial no premie es parte de
//                          lo que dice: todavia no paso nada que resolver.
//   m2            → UNA, SIN ELEGIR. El Pichon te pasa la primera. La pantalla es la misma, con
//                          una sola carta: se aprende QUE es el banco sin tener que decidir.
//   m3 en adelante→ DOS, a elegir. Recien aca empieza el roguelike, con una pirueta ya en la mano
//                          para comparar contra la que se ofrece.
//
// ⚠ CON 14 MISIONES LA CUENTA CAMBIO (guion 3.0, 24/8). Antes eran 12 misiones para 12 mejoras
// y quedaban DOS sin aprender por partida. Ahora hay 14 misiones: con la misma regla habria 13
// ventanas de entrega para 12 mejoras, o sea que el banco se quedaria SIN CARTAS antes del final
// y las dos ultimas misiones no entregarian nada — sin que nada avise, porque `nextUpgrades`
// devuelve lista vacia y la pantalla no se abre.
//
// La regla nueva mete UNA SEGUNDA MISION SIN ENTREGA, y no es un parche numerico: es la m10,
// LOS PRIMOS. Es la unica mision de la campaña donde no se pelea contra nadie —el enemigo es el
// clima, la nafta y el lugar vacio del Pichon— y es ademas la primera despues de su muerte. Que
// el banco no se abra ahi DICE algo: el que inventaba las mejoras no esta, y esa noche no hay
// nada nuevo que aprender. Vuelve a abrirse en m11, ya con el Turco solo.
//
// Quedan 12 ventanas. Hasta el 8/10 eran 12 mejoras y se aprendian TODAS; con las cuatro cartas de
// CHAFITAS el BANCO tiene 16, y quedan CUATRO sin aprender por partida (decision del autor). La perilla
// es esta funcion o el largo del BANCO — no un parche en game.js.
//
// Devuelve CUANTAS cartas ofrece el epilogo de la mision `i` (0-based). Cero = el banco ni se abre.
// Es la unica regla del ritmo del banco y vive aca, no en game.js, por dos motivos: se puede
// probar, y `loadoutAt` la deriva en vez de repetirla — si estuviera escrita dos veces, el
// selector de misiones mostraria un loadout que la campaña no entrega.
export const SIN_ENTREGA = 9;      // m10 LOS PRIMOS, 0-based: la mision sin banco (ver arriba)

export function ofertaTrasMision(i) {
  if ((i | 0) <= 0) return 0;              // el tutorial no entrega
  if ((i | 0) === SIN_ENTREGA) return 0;   // la noche sin el Pichon tampoco
  if ((i | 0) === 1) return 1;             // la segunda entrega una, servida
  return 2;                                // de la tercera en adelante, se elige
}

/** Las proximas `n` mejoras NO aprendidas, en el orden del BANCO. `owned` = Set/array de ids. Una
 *  que pide otra (`requiere`, las MAS CHAFITAS) no se ofrece hasta tenerla. */
//  `tras` = la mision (0-based) cuya ventana ofrece: una carta con `desde` (la BRP) no sale antes.
//  Sin `tras`, sin fecha.
export function nextUpgrades(owned, n, tras) {
  const has = id => owned.includes ? owned.includes(id) : owned.has(id);
  return BANCO.filter(u => !has(u.id) && (!u.requiere || has(u.requiere))
    && !(u.desde != null && tras != null && tras < u.desde)).slice(0, n);
}

// ---------- EL LOADOUT DE REFERENCIA (PLAN_MISIONES_FASES §1, el selector "real real") ----------
// Cuantas mejoras tendria un jugador REAL al entrar a la mision `i`, y cuales.
//
// La cuenta sale del flujo de campaña y no de una tabla escrita a mano: se recorre el mismo
// `ofertaTrasMision` que usa la campaña de verdad y se cuentan las ventanas que SI entregaron.
// Con la rampa de entrada (m1 nada, m2 una servida, m3+ a elegir) al entrar a la mision `i` se
// tienen `i - 1` mejoras, y con 12 misiones quedan DOS sin aprender por partida.
//
// ⚠ ERAN UNA. El guion (§5 de GUION_3) dice "una queda sin aprender por partida" y esa cuenta
// salia de 11 ventanas para 12 mejoras. La rampa saca una ventana —la del tutorial— asi que ahora
// son dos. Es consecuencia directa del pedido, no un descuido; si se quiere volver a una, la
// perilla es esta funcion (o el largo de UPGRADES), no un parche en game.js.
//
// QUE mejoras: las `n` PRIMERAS del orden causal, que es el orden en que el guion las inventa
// (el Pichon las saca del problema que la escuadrilla acaba de sufrir). Son ademas las mas
// basicas — TERRAIN MASKING antes que el TONEL BARRIL — asi que "las primeras" y "las que un
// jugador tendria" son la misma lista, y por eso alcanza una sola funcion.
//
// Es una APROXIMACION declarada, no una simulacion: en una partida real el jugador elige UNA de
// DOS por ventana, asi que su lista puede diferir. Lo que esta funcion garantiza es lo que el
// selector necesita — volar la mision con la CANTIDAD correcta de piruetas y con las que el guion
// ya presento, en vez de con las doce (irreal) o con ninguna (tambien irreal).
//
// El dia que las ofertas sean al azar (DISENO_MISIONES §5, tarea U), ESTA funcion es el unico
// lugar donde cambia la regla.
export function loadoutAt(i) {
  let n = 0;
  for (let j = 0; j < Math.max(0, i | 0); j++) if (ofertaTrasMision(j) > 0) n++;
  return BANCO.slice(0, Math.min(n, BANCO.length)).map(u => u.id);
}
