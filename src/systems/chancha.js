// LA CHANCHA (SPEC_PODER_CHANCHA): el KC-130 Hercules reabastecedor, pedido por radio.
//
// Hermano CARO del MOMENTUM (systems/tempo.js) y con la misma disciplina: barra propia que se
// carga con puntos, una tecla, señales hacia arriba y cero imports de stores — el orquestador le
// pasa lo que necesita y aplica lo que devuelve. `tempo.js` no se toca: son dos poderes
// hermanos con medidores separados.
//
// LA TESIS: lo que compra no es poder, es NAFTA — o sea tiempo. Y se paga volando ALTO, LENTO y
// VISIBLE, que es lo contrario de todo lo que el juego premia. El radar te ve (a esa altura ya
// te ve el sistema de siempre), el multiplicador se cae solo (multOf mide altura) y conectado el
// mundo avanza a CH_SPD_F. Nada de eso es un sistema nuevo: emerge de los que ya estan.
//
// LA CITA SE VUELA. No hay cinematica ni autopiloto: el Hercules sostiene formacion adelante y
// arriba, deriva lento, y meterse en la caja detras de la canasta es pilotaje. Ella no abandona
// jamas — no muere, no aborta, no colisiona. El eslabon debil de la cita sos vos.

import { CH_CHARGE, CH_MIN_T, CH_ETA, CH_ALT, CH_BOX, CH_RATE, CH_WINDOW, CH_SPD_F,
  CH_Z, CH_HOSE_X, CH_HOSE_Y, CH_HOSE_Z, CH_DERIVA, CH_DERIVA_V, CH_SALIDA } from '../data/tuning.js';

// FASES: 'idle' (no pasa nada) · 'eta' (pedida, viniendo) · 'cita' (esta arriba) · 'yendo' (se va).
// No hay estado de JUEGO nuevo: todo esto ocurre adentro de 'play' (RF-06).
let fase = 'idle';
let meter = 0;         // 0..1, la barra del poder (arranca vacia: se gana jugando)
let usada = false;     // una sola vez por CORRIDA — sobrevive al relevo, no al run nuevo
let lastScore = -1;
let etaT = 0, winT = 0, salT = 0, pedidoT = 0;
let conn = false, connT = 0;
let x = 0, t = 0;      // deriva lateral del Hercules y su reloj propio
let subeT = 0;         // cuanto lleva IRSE por arriba (la salida)
let rumT = 0, bombaT = 0;   // cadencias de audio (motores / bomba de transferencia)

/** ¿Donde esta la CANASTA ahora? Es el punto que hay que ir a buscar, y lo comparten la
 *  conexion y el dibujo — si fueran dos cuentas, la caja estaria donde no se ve la canasta. */
function canasta() {
  return { x: x + CH_HOSE_X, y: alturaHoy() - CH_HOSE_Y, z: CH_Z - CH_HOSE_Z };
}

/** La altura del Hercules AHORA. En la salida se va por arriba, que es lo unico que se mueve. */
function alturaHoy() {
  return CH_ALT + (fase === 'yendo' ? (CH_SALIDA - salT) * 14 : 0);
}

/**
 * EL PEDIDO (tecla 5). Devuelve por que NO se pudo, o 'ok'. Los gates se preguntan en orden de
 * lo mas estructural a lo mas circunstancial, asi la respuesta que llega es siempre la mas
 * informativa: "aca no" antes que "todavia no", y "todavia no" antes que "falta barra".
 *
 * `g` = { fuelOn, enPasillo, viva, t } — el orquestador resuelve el mundo, este modulo decide.
 * NUNCA consume la barra si algun gate falla (RF-01).
 */
export function pedir(g) {
  if (!g.fuelOn) return 'nofuel';        // sin combustible el poder no existe: tecla muda
  if (!g.enPasillo) return 'nozone';     // ARENA / PASADA / MINUTOS: ahi la nafta ES el reloj
  if (!g.viva) return 'broken';          // la mision es posterior a la rotura del guion
  if (usada) return 'used';
  if (g.t < CH_MIN_T) return 'early';
  if (meter < 1) return 'empty';
  usada = true; meter = 0;
  fase = 'eta'; etaT = CH_ETA; pedidoT = 0;
  return 'ok';
}

/**
 * Una vez por cuadro, con el dt del MUNDO (no el crudo): el ETA corre en tiempo de mundo, asi
 * que pedirla en camara lenta la hace tardar lo mismo en tiempo de juego — los dos poderes se
 * componen sin pelearse (§8.6).
 *
 * `e` = { inPlay, score, planeX, planeY, fuel, golpe }. Devuelve SIEMPRE un objeto:
 *   { sig, carga, rum, bomba } — `sig` es el evento para radio/beep, `carga` el % de tanque de
 *   este cuadro (el orquestador lo suma: este modulo no escribe stores).
 */
export function tick(dt, e) {
  const out = { sig: null, carga: 0, rum: false, bomba: false };
  if (!e.inPlay) {
    // Salir del pasillo —muerte, relevo, climax, devcam— la DESPIDE. El poder queda gastado: se
    // pidio, vino, y el que no estaba fue el avion. La barra vuelve a cargar desde el score del
    // momento en que se vuelve, como en tempo.js.
    if (fase !== 'idle') { fase = 'idle'; conn = false; }
    lastScore = -1;
    return out;
  }
  if (lastScore < 0) lastScore = e.score;
  if (!usada && meter < 1 && e.score > lastScore) {
    meter = Math.min(1, meter + (e.score - lastScore) / CH_CHARGE);
    if (meter >= 1) out.sig = 'ready';
  }
  lastScore = e.score;
  t += dt;

  if (fase === 'eta') {
    // EL RITUAL DE RADIO corre por `dt` y no por setTimeout (§8.6): asi pedirla en camara lenta
    // no descoloca las respuestas, y una pausa no deja a Condor contestando solo.
    const antes = pedidoT;
    pedidoT += dt;
    if (antes < 0.9 && pedidoT >= 0.9) out.sig = 'ack';
    else if (antes < 2.1 && pedidoT >= 2.1) out.sig = 'come';
    etaT -= dt;
    if (etaT <= 0) { fase = 'cita'; winT = CH_WINDOW; x = 0; conn = false; out.sig = 'llega'; }
    return out;
  }
  if (fase === 'yendo') {
    salT -= dt;
    if (salT <= 0) fase = 'idle';
    return out;
  }
  if (fase !== 'cita') return out;

  // LA CITA. Deriva lenta: sin esto la formacion se sostiene sola y no hay nada que volar.
  x = Math.sin(t * CH_DERIVA_V) * CH_DERIVA;
  winT -= dt;

  // LA CAJA. Es una caja en (x, y) porque la profundidad la fija ella: sostiene formacion, o sea
  // que estar "detras de la canasta" no es algo que el jugador pueda equivocar — lo que tiene
  // que resolver es la puntada, que son dos ejes y no tres.
  const c = canasta();
  const dentro = Math.abs(e.planeX - c.x) < CH_BOX && Math.abs(e.planeY - c.y) < CH_BOX;
  const golpe = !!e.golpe;
  if (dentro && !golpe) {
    if (!conn) { conn = true; connT = 0; out.sig = 'conecta'; }
    connT += dt;
    out.carga = Math.min(CH_RATE * dt, 100 - e.fuel);
    bombaT -= dt;
    if (bombaT <= 0) { bombaT = 0.34; out.bomba = true; }        // la bomba de transferencia
    if (e.fuel + out.carga >= 99.99) { out.sig = 'lleno'; irse(); return out; }
  } else if (conn) {
    conn = false;
    out.sig = golpe ? 'golpe' : 'corta';
  }
  rumT -= dt;
  if (rumT <= 0) { rumT = 0.62; out.rum = true; }                // los motores del Hercules
  if (winT <= 0) { out.sig = 'adios'; irse(); }
  return out;
}

/** Se va por arriba. Lo no cargado se perdio: no hay segunda cita (§8.5). */
function irse() { fase = 'yendo'; salT = CH_SALIDA; conn = false; }

/** Factor del AVANCE DEL MUNDO. Conectado se vuela en formacion: menos distancia y menos puntos,
 *  que es la otra mitad del precio. No toca `run.spd` a proposito — la velocidad del avion es
 *  fisica, y meterle mano ahi seria cambiar como vuela en vez de cuanto avanza. */
export const avance = () => (conn ? CH_SPD_F : 1);

export const activa = () => fase === 'cita' || fase === 'yendo';
export const conectado = () => conn;
export const meterVal = () => meter;
export const gastada = () => usada;

/** LO QUE VE EL RENDER (convencion 4: el dibujo lee, no manda). */
export function snapshot() {
  if (fase === 'idle') return null;
  const c = canasta();
  return {
    fase, x, y: alturaHoy(), z: CH_Z,
    bx: c.x, by: c.y, bz: c.z,
    conn, eta: etaT, win: winT, t,
  };
}

/** Carga la barra a mano. Es LA MITAD de la sonda `__chaset` (la otra mitad —adelantar el reloj
 *  de la mision— vive en game.js, que es quien tiene el run): sin esto, probar los gates
 *  costaria jugar CH_MIN_T segundos de verdad en cada corrida del fixture. QUITAR. */
export function cargar(p) { meter = Math.min(1, meter + (p === undefined ? CH_CHARGE : +p) / CH_CHARGE); return meter; }

/** Arranque de PARTIDA (no de vida): barra vacia y el poder sin usar. Lo llama el reset del run,
 *  igual que resetTempo — por eso el "una vez por corrida" sobrevive al relevo. */
export function resetChancha() {
  fase = 'idle'; meter = 0; usada = false; lastScore = -1;
  etaT = 0; winT = 0; salT = 0; pedidoT = 0; conn = false; connT = 0; x = 0; t = 0;
  rumT = 0; bombaT = 0;
}

// ---------- SONDAS (QUITAR al cerrar el plan) ----------
if (typeof window !== 'undefined') {
  window.__chadbg = () => JSON.stringify({
    fase, meter: +meter.toFixed(3), usada, conn,
    eta: +etaT.toFixed(1), win: +winT.toFixed(1), connT: +connT.toFixed(1),
    x: +x.toFixed(1), bx: +canasta().x.toFixed(1), by: +canasta().y.toFixed(1), caja: CH_BOX,
  });
}
