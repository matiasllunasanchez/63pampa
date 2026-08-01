// TESTS UNITARIOS de la fisica de vuelo (node:test, que viene con Node — sin dependencias).
//   npm run unit
//
// A diferencia de feeltest.js, que simula corridas completas y reporta la SENSACION, esto prueba
// las funciones sueltas en sus casos de borde: los que en el juego son dificiles de provocar y
// justo donde suelen romperse las cosas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  pitchTarget, applyEnergy, applyDrag, scrapeLimit, speedTarget, windFactor, clamp, clamp01,
  PITCH_DELAY, PITCH_RAMP, ENERGY_MAX, SPD_MIN, SCRAPE_BASE, SCRAPE_MIN,
} from '../src/core/physics.js';

const near = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);

test('cabeceo: la zona muerta ignora los toques cortos', () => {
  // Es el motivo de existir de PITCH_DELAY: puntear el gas no debe mover la trompa.
  near(pitchTarget(1, 0, 0), 0);
  near(pitchTarget(1, PITCH_DELAY * 0.99, 0), 0);
  assert.ok(pitchTarget(1, PITCH_DELAY + 0.01, 0) > 0, 'pasada la zona muerta tiene que empezar a subir');
});

test('cabeceo: la rampa llega al maximo y no lo pasa', () => {
  const full = pitchTarget(1, PITCH_DELAY + PITCH_RAMP, 0);
  near(full, 0.9, 1e-9);                                    // 0.9 es el tope del termino de tecla
  assert.ok(pitchTarget(1, 99, 0) <= 1, 'nunca puede pasar de 1');
  assert.ok(pitchTarget(-1, 99, 0) >= -1, 'nunca puede bajar de -1');
});

test('cabeceo: sin tecla, la velocidad vertical igual inclina la trompa', () => {
  // Al soltar el gas y caer, el avion tiene que verse picando aunque no toques nada.
  assert.ok(pitchTarget(0, 0, -40) < 0, 'cayendo deberia picar');
  assert.ok(pitchTarget(0, 0, +40) > 0, 'subiendo deberia trepar');
});

test('cabeceo: es simetrico entre trepar y picar', () => {
  near(pitchTarget(1, 0.5, 0), -pitchTarget(-1, 0.5, 0));
});

test('energia: picar suma velocidad y trepar la resta', () => {
  const base = applyEnergy(100, 150, 0, 1 / 60);
  assert.ok(applyEnergy(100, 150, -30, 1 / 60) > base, 'picando (vy<0) tiene que ir mas rapido');
  assert.ok(applyEnergy(100, 150, +30, 1 / 60) < base, 'trepando (vy>0) tiene que ir mas lento');
});

test('energia: hay techo y hay piso', () => {
  // Una picada larguisima no puede disparar la velocidad al infinito.
  let s = 100;
  for (let i = 0; i < 600; i++) s = applyEnergy(s, 150, -50, 1 / 60);
  assert.ok(s <= 150 * ENERGY_MAX + 1e-9, `se paso del techo: ${s}`);
  // Ni una trepada eterna puede dejarlo en cero.
  let u = 100;
  for (let i = 0; i < 600; i++) u = applyEnergy(u, 150, +50, 1 / 60);
  assert.ok(u >= SPD_MIN, `quedo por debajo del piso: ${u}`);
});

test('energia: conserva mas impulso que el arrastre clasico', () => {
  // Es el punto del cambio: con el arrastre viejo lo ganado picando se evaporaba enseguida.
  let a = 200, b = 200;
  for (let i = 0; i < 30; i++) { a = applyEnergy(a, 100, 0, 1 / 60); b = applyDrag(b, 100, 1 / 60); }
  assert.ok(a > b, 'applyEnergy deberia soltar la velocidad mas despacio que applyDrag');
});

test('roce: el margen se achica con la velocidad y con el turbo', () => {
  near(scrapeLimit(90, false), SCRAPE_BASE);
  near(scrapeLimit(280, false), SCRAPE_MIN);
  assert.ok(scrapeLimit(200, true) < scrapeLimit(200, false), 'con turbo tiene que perdonar menos');
  // fuera de rango no debe devolver disparates
  assert.ok(scrapeLimit(0, false) <= SCRAPE_BASE + 1e-9, 'a velocidad cero no puede dar mas que el maximo');
  assert.ok(scrapeLimit(9999, false) >= SCRAPE_MIN - 1e-9, 'a velocidad absurda no puede dar negativo');
});

test('velocidad objetivo: la racha, el turbo y el afterburner aceleran; el viento frena', () => {
  const base = { t: 30, rasLevel: 0, mult: 1, windF: 1, boost: false, afterTier: 0 };
  const v = speedTarget(base);
  assert.ok(speedTarget({ ...base, boost: true }) > v, 'el turbo acelera');
  assert.ok(speedTarget({ ...base, rasLevel: 4 }) > v, 'la racha rasante acelera');
  assert.ok(speedTarget({ ...base, afterTier: 3 }) > v, 'el afterburner acelera');
  assert.ok(speedTarget({ ...base, windF: 0.7 }) < v, 'el viento en contra frena');
});

test('velocidad objetivo: tiene tope, incluso a tiempo infinito', () => {
  const maxed = speedTarget({ t: 1e6, rasLevel: 4, mult: 10, windF: 1, boost: true, afterTier: 5 });
  assert.ok(maxed <= 280 + 5 * 42, `se paso del tope: ${maxed}`);
});

test('viento: sin viento no frena; con viento frena hasta -35%', () => {
  near(windFactor(99, false), 1);
  near(windFactor(0, true), 1);                       // recien empieza a pegar despues de 0.8s
  assert.ok(windFactor(99, true) >= 0.65 - 1e-9, 'el freno no puede pasar de -35%');
});

test('clamp: casos de borde', () => {
  near(clamp(5, 0, 10), 5); near(clamp(-5, 0, 10), 0); near(clamp(15, 0, 10), 10);
  near(clamp01(0.5), 0.5); near(clamp01(-1), 0); near(clamp01(2), 1);
});

// ---------- ESCUADRON (core/squad.js): las vidas como formacion ----------
// La cinematica y el autopiloto no se prueban aca (tocan stores y canvas); esto cubre la
// logica que decide VIDAS y TIEMPOS — donde un off-by-one significa morir gratis.
import { canRelevo, pilotIdx, callsign, relevoPhase, formationSlots,
  RELEVO_WRECK, RELEVO_GRACE, RELEVO_DUR } from '../src/core/squad.js';

test('escuadron: con un solo avion NO hay relevo — morir es morir, como siempre', () => {
  assert.equal(canRelevo(1), false);
  assert.equal(canRelevo(0), false);   // borde: nunca puede relevar "en negativo"
  assert.equal(canRelevo(2), true);
});

test('escuadron: el descuento de vidas nombra al piloto correcto', () => {
  // escuadron de 4: arranca el lider (PATRIA 1); cae uno → asume PATRIA 2; con la ultima
  // vida vuela PATRIA 4. pilotIdx nunca puede pasarse del escuadron.
  assert.equal(pilotIdx(4, 4), 0);
  assert.equal(pilotIdx(4, 3), 1);
  assert.equal(pilotIdx(4, 1), 3);
  assert.equal(pilotIdx(4, 0), 4);     // ya no queda nadie: el "siguiente" no existe
  assert.equal(callsign(0), 'PATRIA 1');
  assert.equal(callsign(3), 'PATRIA 4');
});

test('relevo: la ventana de gracia cubre TODA la cinematica y expira al final', () => {
  near(RELEVO_DUR, RELEVO_WRECK + RELEVO_GRACE);       // un solo reloj, sin desfasajes posibles
  assert.equal(relevoPhase(0).beat, 'wreck');
  assert.equal(relevoPhase(RELEVO_WRECK + 0.01).beat, 'handoff');
  assert.ok(relevoPhase(0).invuln, 'invulnerable desde el primer frame');
  assert.ok(relevoPhase(RELEVO_DUR - 0.01).invuln, 'invulnerable hasta el ultimo frame');
  assert.ok(!relevoPhase(RELEVO_DUR - 0.01).done);
  assert.ok(relevoPhase(RELEVO_DUR).done, 'al cumplirse el tiempo devuelve el control');
});

test('formacion: N aviones son N-1 puestos, alternando lados y sin encimarse', () => {
  assert.equal(formationSlots(1).length, 0);           // solo: no hay formacion que dibujar
  const s = formationSlots(8);
  assert.equal(s.length, 7);
  assert.ok(s[0].dx < 0 && s[1].dx > 0, 'el primer par escolta uno por cada lado');
  const seen = new Set(s.map(p => p.dx + '/' + p.dz));
  assert.equal(seen.size, 7, 'dos numerales no pueden volar en el mismo punto');
  for (const p of s) assert.ok(p.dz < 0, 'detras del lider = mas cerca de la camara (z menor)');
});

// ---------- HORIZONTE GIRATORIO (core/horizon.js): cuanto se inclina el mundo ----------
// Lo que se prueba es la REGLA, no el dibujo: que FIJO no mueva nada, que el mundo gire al reves
// que el avion (camara pegada al avion) y que la pirueta le gane al alabeo continuo.
import { horizonRoll, HZ_FIX, HZ_MOVES, HZ_ALL, HZ_FREE, BANK_TILT } from '../src/core/horizon.js';

test('horizonte FIJO: nada lo inclina, ni pirueta ni alabeo', () => {
  assert.equal(horizonRoll(HZ_FIX, Math.PI, 1), 0);
  assert.equal(horizonRoll(HZ_FIX, 0, -1), 0);
});

test('horizonte: el mundo gira al REVES que el avion (la camara rola con el)', () => {
  near(horizonRoll(HZ_MOVES, 1.2, 0), -1.2);
  near(horizonRoll(HZ_ALL, -0.7, 0), 0.7);
});

test('horizonte EN PIRUETAS: el alabeo continuo no lo mueve; TOTAL si', () => {
  assert.equal(horizonRoll(HZ_MOVES, 0, 1), 0, 'sin pirueta, PIRUETAS deja el horizonte quieto');
  near(horizonRoll(HZ_ALL, 0, 1), -BANK_TILT);
  near(horizonRoll(HZ_ALL, 0, -0.5), BANK_TILT * 0.5);
});

test('horizonte: la pirueta MANDA sobre el alabeo, y el alabeo esta acotado', () => {
  near(horizonRoll(HZ_ALL, 2, 1), -2);          // durante el tonel el banqueo no agrega nada
  near(horizonRoll(HZ_ALL, 0, 9), -BANK_TILT);  // un bank fuera de rango no puede volcar el mundo
});

// El INSTRUMENTO (horizonte artificial del HUD) no lee lo mismo que el fondo, y es a proposito.
import { attitude, BANK_FULL } from '../src/core/horizon.js';
import { plane } from '../src/core/state.js';
import { run } from '../src/core/run.js';

test('actitud: el instrumento lee el alabeo REAL, no el amortiguado del fondo', () => {
  run.rollT = 0; run.mvRoll = 0;
  plane.bank = 1;
  near(attitude(), BANK_FULL);            // bank ±1 son los ±60 grados del sprite horneado
  // El fondo tiene que quedar por DEBAJO DE LA MITAD de la actitud real. El limite se escribe
  // contra las constantes y no contra un numero fijo a proposito: BANK_TILT es una perilla de
  // sensacion y ya se movio una vez (0.22 → 0.44). Lo que no puede cambiar es la RELACION —
  // el instrumento dice la verdad, la camara amortigua— y eso es lo que se prueba aca.
  near(Math.abs(horizonRoll(HZ_ALL, 0, 1)), BANK_TILT);
  assert.ok(BANK_TILT < BANK_FULL / 2,
    'el fondo se inclina MUCHO menos que la actitud real: el instrumento no miente, la camara si');
  plane.bank = 0; run.mvRoll = 1.4;
  near(attitude(), 1.4);                  // durante la pirueta manda la pirueta
  run.mvRoll = 0;
});

test('horizonte LIBRE: el giro a voluntad solo cuenta en LIBRE, y SE SUMA a la pirueta', () => {
  assert.equal(horizonRoll(HZ_MOVES, 0, 0, 4), 0, 'fuera de LIBRE el giro libre no existe');
  assert.equal(horizonRoll(HZ_ALL, 0, 0, 4), 0);
  near(horizonRoll(HZ_FREE, 0, 0, Math.PI), -Math.PI, 1e-9);   // boca abajo y ahi se queda
  near(horizonRoll(HZ_FREE, 1, 0, 2), -3);                     // pirueta + giro = dos vueltas
  // sin tope: dar tres vueltas tiene que valer tres vueltas, no quedar envuelto en una
  near(horizonRoll(HZ_FREE, 0, 0, 6 * Math.PI), -6 * Math.PI, 1e-9);
});

test('horizonte: girando libre, el banqueo sigue sumando; en pirueta no', () => {
  near(horizonRoll(HZ_FREE, 0, 1, Math.PI), -(Math.PI + BANK_TILT));
  near(horizonRoll(HZ_FREE, 0.5, 1, Math.PI), -(Math.PI + 0.5));   // la pirueta anula el banqueo
});

// La RED DE RADAR se funde cuando el mundo se inclina (render/world.js la consulta). El borde que
// importa es el de ABAJO: el modo TOTAL inclina de a poco TODO el tiempo y no debe apagarla nunca.
import { tiltFade, TILT_FADE0, TILT_FADE1 } from '../src/core/horizon.js';

test('inclinacion: la red se apaga RAPIDO — con el mundo torcido no queda nada', () => {
  assert.equal(tiltFade(0), 1);
  assert.equal(tiltFade(TILT_FADE1), 0);
  assert.ok(TILT_FADE1 <= 0.27, `a ${(TILT_FADE1 * 57.3).toFixed(0)} grados todavia se veria`);
  assert.equal(tiltFade(0.35), 0, 'a 20 grados de tonel la red ya no esta');
  assert.equal(tiltFade(Math.PI), 0, 'boca abajo, apagada');
  assert.equal(tiltFade(-Math.PI), 0, 'y da lo mismo para que lado rolaste');
  near(tiltFade((TILT_FADE0 + TILT_FADE1) / 2), 0.5);
});

test('inclinacion: el BANQUEO tambien la funde — es la inclinacion que se VE, no de donde viene', () => {
  // Esto afirma lo CONTRARIO de lo que afirmaba la version anterior de este test, y a proposito.
  // Antes el banqueo estaba excluido del fundido "por construccion", para poder ser agresivo sin
  // apagar la red al doblar en modo TOTAL. Pero con CONTROL POR ALABEO el avion banquea todo el
  // tiempo: la red se quedaba entera justo mientras el mundo estaba torcido. El jugador no ve
  // "una maniobra" ni "un banqueo" — ve el mundo inclinado.
  assert.equal(tiltFade(BANK_TILT), 0,
    `banqueando a fondo en TOTAL (${(BANK_TILT * 57.3).toFixed(0)}°) la red tiene que estar APAGADA, no tenue`);
  assert.ok(TILT_FADE1 < BANK_TILT, 'si el fundido terminara despues del tope de banqueo, quedaria un fantasma');
  assert.equal(tiltFade(0.04), 1, 'pero volando derecho, con el bamboleo normal, sigue entera');
});
// ---------- CONTROL POR ALABEO (core/physics.js) ----------
// Lo que hay que garantizar no es que "se sienta bien" sino que el TECHO no se mueva: es una
// opcion de acople, no de dificultad. Si el tope lateral cambiara, seria otro juego.
import { bankStep, bankVx, BANK_RATE, BANK_MAX, BANK_TURN_V } from '../src/core/physics.js';

test('alabeo: el tope lateral es el MISMO que el del control directo (~30)', () => {
  const top = Math.abs(bankVx(BANK_MAX));
  assert.ok(top > 29 && top < 31, `el tope quedo en ${top}, y el directo esta clavado en 30`);
  assert.equal(bankVx(0), 0, 'con las alas a nivel no hay deriva: vx es cero por definicion');
});

test('alabeo: la respuesta satura de a poco — el ultimo cuarto rinde ~39% menos que el primero', () => {
  const q = [0, 0.25, 0.5, 0.75, 1].map(f => bankVx(BANK_MAX * f));
  for (let i = 1; i < 4; i++)
    assert.ok(q[i + 1] - q[i] < q[i] - q[i - 1], 'cada cuarto tiene que rendir menos que el anterior');
  const primero = q[1] - q[0], ultimo = q[4] - q[3];
  assert.ok(ultimo > primero * 0.5 && ultimo < primero * 0.7,
    `saturacion SUAVE: ni plana ni un muro (ultimo ${ultimo.toFixed(2)} vs primero ${primero.toFixed(2)})`);
  for (let a = -Math.PI; a <= Math.PI; a += 0.05) assert.ok(Math.abs(bankVx(a)) <= BANK_TURN_V + 1e-9);
});

test('alabeo: rolar a fondo llega al tope en ~0.3 s y no lo pasa', () => {
  let b = 0;
  for (let i = 0; i < 18; i++) b = bankStep(b, 1, 1 / 60);   // 0.30 s a fondo
  near(b, BANK_MAX, 0.02);
  for (let i = 0; i < 600; i++) b = bankStep(b, 1, 1 / 60);  // insistir no lo pone de espaldas
  assert.equal(b, BANK_MAX);
  assert.equal(bankStep(0, -1, 99), -BANK_MAX, 'un dt absurdo tampoco lo desborda');
});

test('alabeo: el banqueo SE SOSTIENE — soltar no nivela las alas de golpe', () => {
  // Es LA diferencia con el control directo, y estuvo rota: con BANK_BACK = 4.5 las alas volvian
  // solas en 0.2 s, soltar cortaba el viraje igual que siempre y los dos esquemas se sentian
  // identicos. Este test es el que no deja que vuelva a pasar.
  const tras = s2 => { let b = BANK_MAX; for (let i = 0; i < 60 * s2; i++) b = bankStep(b, 0, 1 / 60); return b; };
  assert.ok(tras(0.5) > BANK_MAX * 0.4, `medio segundo despues de soltar tenes que seguir banqueado (${tras(0.5)})`);
  assert.ok(tras(2) < BANK_MAX * 0.12, 'pero a los 2 s ya tiene que estar practicamente a nivel');
  // CONTRA-ROLAR tiene que ser bastante mas rapido que esperar: es lo que premia volar activo
  let b = BANK_MAX, n = 0;
  while (b > 0 && n < 600) { b = bankStep(b, -1, 1 / 60); n++; }
  assert.ok(n / 60 < 0.35, `contra-rolar deberia cortar en menos de 0.35 s, tardo ${(n / 60).toFixed(2)}`);
});

test('alabeo: es simetrico entre los dos lados', () => {
  near(bankStep(0.4, 1, 0.1), -bankStep(-0.4, -1, 0.1));
  near(bankStep(0.4, 0, 0.1), -bankStep(-0.4, 0, 0.1));
});
