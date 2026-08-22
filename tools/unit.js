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

import { PRUEBAS, momentos } from '../src/data/pruebas.js';

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

// ---------- MOTOR DE LINEAS del modo historia (core/dialogue.js, SPEC_MODO_HISTORIA F1) ----------
// Se prueba aca y no a ojo porque lo que tiene que ser EXACTO es el tiempo: el `hold` de 4 s
// despues de "El Vasco tenia quince años" es la escena entera. Un motor que lo respeta "casi"
// no se nota mirando y arruina la unica actuacion que tiene un juego sin voces.
const dlgMod = await import('../src/core/dialogue.js');
const { dlg, startSeq, stepDialogue, pressDialogue, canAdvance, holdLeft, txtOf, line, scene,
        sceneFromScreen, splitSpeaker, seqFromScreens, autoSecs, TYPE_CPS } = dlgMod;
const { SCENES } = await import('../src/data/story.js');

/** Corre el motor `s` segundos a 60 fps (como el juego). */
const run60 = s => { for (let i = 0; i < Math.round(s * 60); i++) stepDialogue(1 / 60); };
const locker = () => startSeq([SCENES.M07_LOCKER], 'es');

test('historia: el fixture del locker esta completo y con sus holds', () => {
  const sc = SCENES.M07_LOCKER;
  assert.equal(sc.lineas.length, 6);
  assert.deepEqual(sc.lineas.map(l => l.hold), [2.0, 1.0, 2.5, 1.5, 4.0, 2.0]);
  // IDs estables, de 10 en 10 y sin repetir (regla D1 — lo que habilita voces y traduccion)
  assert.deepEqual(sc.lineas.map(l => l.id), [
    'M07_LOCKER_010', 'M07_LOCKER_020', 'M07_LOCKER_030',
    'M07_LOCKER_040', 'M07_LOCKER_050', 'M07_LOCKER_060']);
  assert.equal(new Set(sc.lineas.map(l => l.id)).size, 6);
});

test('historia: tipea letra por letra y termina a los caracteres/CPS', () => {
  locker();
  const n = txtOf(line()).length;
  assert.equal(dlg.typed, 0);
  run60(0.5);
  assert.ok(dlg.typed > 0 && dlg.typed < n, `a mitad de camino, no de golpe (${dlg.typed}/${n})`);
  assert.equal(dlg.done, false);
  run60(n / TYPE_CPS + 0.1);
  assert.equal(dlg.typed, n);
  assert.equal(dlg.done, true);
});

test('historia: un toque COMPLETA la linea, no la saltea (RF-02)', () => {
  locker();
  run60(0.2);
  assert.equal(pressDialogue(), 'complete');
  assert.equal(dlg.typed, txtOf(line()).length, 'el texto queda entero en pantalla');
  assert.equal(dlg.li, 0, 'y seguimos en la MISMA linea');
});

test('historia: el hold no se puede saltear, y dura exactamente lo que dice (RF-07)', () => {
  locker();
  pressDialogue();                                   // completa la linea 010 (hold 2.0)
  assert.equal(canAdvance(), false, 'apenas termina de tipearse ya esta en silencio');
  near(holdLeft(), 2.0, 1e-9);
  run60(1.9);
  assert.equal(pressDialogue(), null, 'el toque se IGNORA mientras corre el hold');
  assert.equal(dlg.li, 0);
  assert.ok(holdLeft() > 0);
  run60(0.12);                                       // pasados los 2.0 s
  assert.equal(holdLeft(), 0);
  assert.equal(canAdvance(), true);
  assert.equal(pressDialogue(), 'next');
  assert.equal(dlg.li, 1);
});

test('historia: el 4.0 de "El Vasco tenia quince años" son 4 segundos clavados', () => {
  // El criterio de aceptacion textual del spec (§6). Se mide igual que lo viviria el jugador:
  // apretando cada cuadro desde que la linea quedo completa hasta que el motor deja pasar.
  locker();
  for (let i = 0; i < 4; i++) { pressDialogue(); dlg.t += 99; stepDialogue(0); pressDialogue(); }
  assert.equal(dlg.li, 4, 'estamos en la linea del Vasco');
  assert.equal(txtOf(line()), 'El Vasco tenía quince años.');
  pressDialogue();                                   // completar el tipeo
  let s = 0;
  while (pressDialogue() === null && s < 10) { stepDialogue(1 / 60); s += 1 / 60; }
  assert.ok(Math.abs(s - 4.0) < 1 / 30, `el silencio duro ${s.toFixed(3)} s, tenia que durar 4.0`);
});

test('historia: la secuencia se termina y avisa UNA vez (no se pasa de largo)', () => {
  locker();
  let guard = 0;
  for (;;) {
    const r = pressDialogue();
    if (r === 'end') break;
    if (r === null) dlg.t += 99;                     // esperar el hold de turno
    stepDialogue(0);
    assert.ok(++guard < 200, 'la escena no termina nunca');
  }
  assert.equal(dlg.li, 5, 'termina en la ULTIMA linea, no en una vacia');
});

test('historia: sin ningun asset la escena igual corre entera (P2)', () => {
  // El motor no mira imagenes ni sonidos: placa/retrato/ambiente son nombres que el render
  // resuelve o descarta. Si algun dia esto deja de ser cierto, la campaña se cuelga sin assets.
  const sc = SCENES.M07_LOCKER;
  assert.ok(sc.placa && sc.ambiente, 'la escena los DECLARA...');
  locker();
  for (const l of sc.lineas) { assert.ok(txtOf(line()).length > 0); pressDialogue(); dlg.t += 99; stepDialogue(0); pressDialogue(); }
  assert.equal(scene().id, 'M07_LOCKER');
});

test('historia: una linea puede cambiar de registro sin cortar la escena', () => {
  // el dorso de la foto (030) es un CUADRO adentro de una escena VN — la mezcla es por linea
  const l = SCENES.M07_LOCKER.lineas[2];
  assert.equal(l.tipo, 'CUADRO');
  assert.equal(l.img, 'M7_FOTO_DORSO');
  assert.equal(SCENES.M07_LOCKER.tipo, 'VN');
});

test('historia: el adaptador entiende quien habla en el guion viejo', () => {
  assert.deepEqual(splitSpeaker('PUMA: pegado al agua'), { personaje: 'PUMA', txt: 'pegado al agua' });
  assert.deepEqual(splitSpeaker('EL TURCO: la estrellita'), { personaje: 'EL TURCO', txt: 'la estrellita' });
  assert.deepEqual(splitSpeaker('CÓNDOR: autorizada pista dos'), { personaje: 'CÓNDOR', txt: 'autorizada pista dos' });
  // el cuaderno de Mateo NO es un hablante: "Viejo:" no esta en mayusculas, es narracion
  assert.equal(splitSpeaker('Viejo: llegamos.').personaje, null);
  assert.equal(splitSpeaker('La pava empieza a chiflar.').personaje, null);
});

test('historia: el adaptador convierte una pantalla vieja en escena', () => {
  const s = sceneFromScreen({ img: 'M1_3', title: 'LA LÍNEA DE VUELO',
    paras: ['PUMA: regla numero uno.', 'El Vasco se persigna.'] }, 'STORYM1_9');
  assert.equal(s.tipo, 'VN');
  assert.equal(s.titulo, 'LA LÍNEA DE VUELO');
  assert.equal(s.lineas.length, 2);
  assert.deepEqual(s.lineas.map(l => l.id), ['STORYM1_9_010', 'STORYM1_9_020']);
  assert.equal(s.lineas[0].personaje, 'PUMA');
  assert.equal(s.lineas[1].personaje, null);
  assert.equal(s.lineas[0].hold, 0, 'el guion viejo no tiene holds: caen a 0, no se inventan');
  // los registros del cuaderno y de la carta se conservan
  assert.equal(sceneFromScreen({ style: 'tierra', paras: ['a'] }, 'X').tipo, 'TIERRA');
  assert.equal(sceneFromScreen({ style: 'carta', paras: ['a'] }, 'X').tipo, 'CARTA');
  // la tarjeta previa al nivel: el titulo es el nombre de la mision, el objetivo es la linea
  const card = sceneFromScreen({ level: 'MISIÓN 1', obj: 'Objetivo: volar bajo' }, 'X');
  assert.equal(card.tipo, 'TARJETA');
  assert.equal(card.titulo, 'MISIÓN 1');
  assert.equal(card.lineas.length, 1);
});

test('historia: una escena sin lineas no cuelga la secuencia', () => {
  startSeq(seqFromScreens([{ level: 'MISIÓN 1' }, { paras: ['unica linea'] }], 'x'), 'es');
  assert.equal(dlg.done, true, 'sin texto que tipear ya esta lista');
  assert.equal(pressDialogue(), 'scene');
  assert.equal(dlg.si, 1);
});

test('historia: el auto-avance usa la formula del sistema de dialogo (RF-03)', () => {
  near(autoSecs(12, 0), 1.6, 1e-9);                  // el minimo protege las lineas cortas
  near(autoSecs(120, 0), 10, 1e-9);                  // 12 caracteres por segundo
  near(autoSecs(120, 2.5), 12.5, 1e-9);              // y el hold se suma SIEMPRE
  locker();
  assert.equal(dlg.auto, false, 'apagado por defecto');
  dlg.auto = true;
  const n = txtOf(line()).length;
  run60(autoSecs(n, 2.0) - 0.1);
  assert.equal(dlg.li, 0);
  const before = dlg.li;
  let fired = null;
  for (let i = 0; i < 20 && !fired; i++) fired = stepDialogue(1 / 60);
  assert.equal(fired, 'auto', 'pasado el tiempo pide avanzar solo');
  assert.equal(before, 0);
  dlg.auto = false;
});

import { moveAllowed } from '../src/data/upgrades.js';

// ---------- MEJORAS DEL PICHON: que piruetas SALEN ----------
// La regla no tiene sintoma visible cuando se rompe: la pirueta simplemente deja de salir y se lee
// como que el combo no anda. Por eso se prueba acá y no a mano.
test('mejoras: fuera de campaña salen todas, tengas o no el banco', () => {
  assert.equal(moveAllowed('jink', { campaign: false, owned: [], off: {} }), true);
  assert.equal(moveAllowed('jink', { campaign: false, owned: null, off: null }), true);
});

test('mejoras: en campaña solo salen las GANADAS', () => {
  const owned = ['mask', 'splits'];
  assert.equal(moveAllowed('mask', { campaign: true, owned, off: {} }), true);
  assert.equal(moveAllowed('jink', { campaign: true, owned, off: {} }), false,
    'una pirueta que el guion todavia no invento no puede salir');
});

test('mejoras: apagarla desde el menu la saca aunque la tengas ganada', () => {
  const owned = ['mask'];
  assert.equal(moveAllowed('mask', { campaign: true, owned, off: { mask: 1 } }), false);
  assert.equal(moveAllowed('mask', { campaign: false, owned: [], off: { mask: 1 } }), false,
    'apagada es apagada en todos los modos: es una preferencia, no una regla de campaña');
});

test('mejoras: prenderla de nuevo la devuelve al aire', () => {
  const off = { mask: 1 };
  delete off.mask;                                   // exactamente lo que hace la fila del menu
  assert.equal(moveAllowed('mask', { campaign: true, owned: ['mask'], off }), true);
});

test('mejoras: acepta un Set ademas de un array (owned viaja de las dos formas)', () => {
  assert.equal(moveAllowed('mask', { campaign: true, owned: new Set(['mask']), off: {} }), true);
  assert.equal(moveAllowed('jink', { campaign: true, owned: new Set(['mask']), off: {} }), false);
});

// ---------- INTEGRIDAD / MODELOS DE VIDA (src/core/damage.js) ----------
// La regla que sostiene todo el sistema: te DISPARAN → daño; CHOCAS algo → muerte, en los tres
// modos. Si esto se afloja, el rasante deja de tener consecuencias y el juego cambia de genero.
import { applyHit, effects, tierOf, isFatal, DMG_MODES, DMG } from '../src/core/damage.js';

test('averias: en el modo ESCUADRON cualquier impacto cae, como siempre', () => {
  for (const c of Object.keys(DMG)) {
    assert.equal(applyHit(100, c, 'squad').down, true, c + ' deberia caer en modo escuadron');
  }
});

test('averias: chocar MATA en los tres modos (el mar no negocia)', () => {
  for (const m of DMG_MODES) {
    assert.equal(applyHit(100, 'death_sea', m).down, true, 'mar en modo ' + m);
    assert.equal(applyHit(100, 'death_mast', m).down, true, 'mastil en modo ' + m);
    assert.equal(applyHit(100, 'death_cliff', m).down, true, 'barranca en modo ' + m);
  }
  assert.equal(isFatal('death_sea'), true);
  assert.equal(isFatal('death_aa'), false, 'que te tiren no es chocar');
});

test('averias: por integridad el avion AGUANTA y recien cae al vaciarse', () => {
  let integ = 100, caidas = 0, golpes = 0;
  while (golpes < 10) {
    const r = applyHit(integ, 'death_aa', 'integ');
    integ = r.integ; golpes++;
    if (r.down) { caidas++; break; }
  }
  assert.equal(caidas, 1);
  assert.equal(golpes, 3, 'tres antiaereos (34 c/u) tienen que bajar un avion entero');
});

test('averias: el modo VISUAL cuenta el daño igual pero NO toca el desempeño', () => {
  const r = applyHit(100, 'death_aa', 'visual');
  assert.equal(r.integ, 66, 'la integridad baja lo mismo que en integ');
  assert.equal(r.down, false);
  // ...y sin embargo el avion responde como nuevo: esa es toda la diferencia entre los dos modos
  assert.equal(effects(30, 'visual').turbo, true);
  assert.equal(effects(30, 'visual').spd, 1);
  assert.equal(effects(30, 'integ').turbo, false, 'en integ, a 30% ya no hay turbo');
});

test('averias: los escalones degradan en orden y el ultimo deja SOLO LO BASICO', () => {
  assert.equal(tierOf(100).id, 'ok');
  assert.equal(tierOf(60).id, 'hit');
  assert.equal(tierOf(30).id, 'dmg');
  assert.equal(tierOf(10).id, 'crit');
  assert.equal(tierOf(0).id, 'crit', 'cero cae en el ultimo escalon, no fuera de la tabla');
  const [ok, hit, dmg, crit] = [100, 60, 30, 10].map(v => effects(v, 'integ'));
  assert.ok(ok.spd > hit.spd && hit.spd > dmg.spd && dmg.spd > crit.spd, 'la punta baja monotona');
  assert.equal(ok.turbo && hit.turbo, true);
  assert.equal(dmg.turbo || crit.turbo, false, 'el turbo se pierde de AVERIADO para abajo');
  assert.equal(crit.moves, false, 'en critico no salen piruetas: solo volar y disparar');
});

// ---------- EL CLIMAX DE CADA MISION (SPEC_MODO_PASADA RF-14) ----------
import { MISSIONS, climaxOf } from '../src/data/missions.js';

test('climax: es DATO de la mision, y el default de una con buque es la PASADA', () => {
  // El criterio de aceptacion de RF-14, literal: cambiar el campo cambia el climax sin tocar
  // codigo. Por eso se prueba la funcion con misiones inventadas y no solo con las de la campaña.
  assert.equal(climaxOf({ goal: { kind: 'ship' } }), 'pasada', 'sin campo, una mision con buque va a la PASADA');
  assert.equal(climaxOf({ goal: { kind: 'ship' }, climax: 'arena' }), 'arena');
  assert.equal(climaxOf({ goal: { kind: 'distance' } }), null, 'sin buque no hay climax: la cierra el PASILLO');
  assert.equal(climaxOf({ goal: { kind: 'distance' }, climax: 'arena' }), null, 'el campo no le inventa un buque');
  // EL PULSO entra por la MISMA puerta (Q4): una palabra en el renglon de la mision y nada mas.
  // Hoy ninguna mision de la campaña lo pide (plan §6.5), pero el enchufe tiene que estar listo
  // para el dia que m14 exista — o para el dia que el rescate de la PASADA no pase su gate.
  assert.equal(climaxOf({ goal: { kind: 'ship' }, climax: 'pulso' }), 'pulso');
});

test('climax: la campaña respeta la regla del autor — la mayoria PASADA, el ARENA ocasional', () => {
  const conBuque = MISSIONS.filter(m => m.goal.kind === 'ship');
  const arena = conBuque.filter(m => climaxOf(m) === 'arena');
  assert.ok(conBuque.every(m => ['pasada', 'arena', 'pulso'].includes(climaxOf(m))), 'ningun climax desconocido');
  // …y EL PULSO todavia no juega ninguna: el plan §6.5 lo ata a que caiga el gate de la PASADA o a
  // que exista m14. Si algun dia se le asigna una mision, este assert es el que hay que venir a
  // cambiar A PROPOSITO — no puede pasar de contrabando.
  assert.equal(conBuque.filter(m => climaxOf(m) === 'pulso').length, 0, 'EL PULSO no reemplaza a la PASADA de oficio');
  assert.ok(arena.length * 2 < conBuque.length, 'el ARENA tiene que ser la excepcion, no la regla');
  assert.deepEqual(arena.map(m => m.id), ['m4', 'm12'], 'el callejon de San Carlos y el final');
  assert.equal(MISSIONS.filter(m => m.goal.kind !== 'ship').every(m => climaxOf(m) === null), true);
});

// ---------- EL CARRIL CUBRE LA ZONA DE VUELO (bug del 16/8: la punta era refugio) ----------
import { FLY_X, SPAWN_X, SPAWN_EDGE, SPAWN_X0, SPAWN_DENS } from '../src/data/tuning.js';
import { hitbox, planeBox } from '../src/core/hitbox.js';

test('carril: no existe una punta del pasillo donde no te pueda tocar nada', () => {
  // EL BUG, reportado jugando: "si me pongo BIEN EN LA PUNTA del pasillo, paso todo sin
  // colisionar". Era exacto — FLY_X 38 contra SPAWN_X 33 dejaba 5 unidades a cada lado donde no
  // nacia nada, y un obstaculo del carril mas externo no llegaba a tocarte. Medido en el juego:
  // en el centro morias a los 15-18 s sin esquivar; en la punta sobrevivias indefinidamente.
  //
  // Esta prueba es PURA y por eso vale mas que volar 26 segundos: la geometria no tiene varianza.
  // El obstaculo mas ANGOSTO es el que manda — si ese llega, llegan todos.
  const { pw } = planeBox(false);
  const angosto = Math.min(
    hitbox({ type: 'helo', y: 8 }).hw,     // aereo
    hitbox({ type: 'mast', h: 6 }).hw,     // de superficie
  );
  const alcance = angosto + pw;
  assert.ok(SPAWN_X >= FLY_X,
    `el carril (${SPAWN_X}) tiene que llegar al menos hasta el limite de vuelo (${FLY_X})`);
  // y con margen: si el carril terminara JUSTO en FLY_X, el borde veria la mitad de obstaculos que
  // el centro (de un lado no hay de donde vengan) y volar pegado a la pared seguiria siendo barato
  assert.ok(SPAWN_EDGE >= alcance - 1,
    `el margen del carril (${SPAWN_EDGE}) tiene que cubrir el alcance del obstaculo mas angosto (${alcance})`);
});

test('carril: ensancharlo NO cambia la dificultad del medio', () => {
  // El caudal de obstaculos se mide por DISTANCIA, no por ancho: repartir los mismos en un carril
  // mas ancho baja la densidad que el jugador siente. Arreglar un exploit no puede volver el juego
  // mas facil de rebote, asi que la cadencia se compensa en la MISMA proporcion.
  assert.ok(Math.abs(SPAWN_DENS - SPAWN_X0 / SPAWN_X) < 1e-9, 'la compensacion sale de la geometria, no de un numero a ojo');
  assert.ok(SPAWN_DENS < 1, 'el carril se ensancho, asi que se siembra mas seguido');
});

// ---------------- EL PULSO: la escalada de la prueba (core/pulso.js) ----------------
// Es la unica perilla de dificultad del climax, y si se rompe no da error: simplemente la prueba
// queda regalada o imposible, y eso solo se descubre jugando la campaña entera.
import { beatFor, barsFor, errFor, poolFor, armar, armarZonas,
  parSecsFor, sellosDe, puntosDe, sellosN } from '../src/core/pulso.js';
import { PULSO, PULSO_PREMIO, PULSO_CLASE, COMPASES, PULSO_ZONAS, POOL_BASICO } from '../src/data/pulso.js';

test('pulso: el margen se achica con el nivel y con el flak', () => {
  assert.ok(beatFor(0, 0) > beatFor(1, 0), 'la ultima mision tiene que apretar mas que la primera');
  near(beatFor(0, 0), PULSO.T_BEAT[0]);
  near(beatFor(1, 0), PULSO.T_BEAT[1]);
  assert.ok(beatFor(0.5, 2) < beatFor(0.5, 0), 'cada grado de flak tiene que costar aire');
  // fuera de rango no puede devolver basura: el t01 lo calcula game.js y un off-by-one no puede
  // convertirse en un margen negativo (la prueba fallaria sola en el primer cuadro)
  assert.ok(beatFor(-3, 0) > 0 && beatFor(9, 9) > 0);
});

test('pulso: la secuencia crece con el nivel y la zona brava pide una mas', () => {
  assert.ok(barsFor(1, 0) > barsFor(0, 0), 'la campaña tiene que ir pidiendo mas');
  assert.equal(barsFor(0.5, 1) - barsFor(0.5, -1), 2, 'polvorin pide dos compases mas que el radar');
  assert.ok(barsFor(0, -1) >= 0, 'la zona facil del primer nivel no puede pedir compases negativos');
  // el techo del plan: la prueba entera no pasa de ~10 s (§6.3). Peor caso = ultima mision,
  // zona brava, margen minimo.
  const peor = (barsFor(1, 1) + 1) * beatFor(1, 0);
  assert.ok(peor <= 10, `la prueba mas larga da ${peor.toFixed(1)} s y no puede pasar de 10`);
});

test('pulso: el perdon existe al principio y se termina', () => {
  assert.equal(errFor(0), 1, 'en las primeras misiones se perdona un error');
  assert.equal(errFor(1), 0, 'al final no se perdona nada');
});

test('pulso: en campaña el examen SOLO toma lo aprendido (regla 1)', () => {
  // sin libreta no hay piruetas que pedir: la secuencia queda en el remate, que es exactamente
  // lo unico que el juego enseño hasta la primera mision. No es un pool vacio por error.
  assert.equal(poolFor({ campaign: true, owned: [] }).length, 0);
  assert.deepEqual(armar([], 3), ['Z'], 'sin pool aprendido la secuencia es solo la suelta');
  // con una aprendida, esa y nada mas
  const p = poolFor({ campaign: true, owned: ['breakt'] });
  assert.ok(p.length > 0 && p.every(c => c.move === 'breakt'));
  // y una apagada a mano no puede colarse en el examen
  assert.equal(poolFor({ campaign: true, owned: ['breakt'], off: { breakt: 1 } }).length, 0);
});

test('pulso: fuera de campaña rige el pool basico', () => {
  const p = poolFor({ campaign: false });
  assert.ok(p.length === POOL_BASICO.length && p.every(c => POOL_BASICO.includes(c.seq)));
});

test('pulso: la secuencia no repite maniobra seguida y termina soltando', () => {
  const pool = poolFor({ campaign: false });
  for (let i = 0; i < 40; i++) {
    const s = armar(pool, 4, () => (i * 0.137 + 0.01) % 1);
    assert.equal(s[s.length - 1], 'Z', 'toda secuencia termina en el remate');
    for (let k = 1; k < s.length - 1; k++) {
      const a = COMPASES.find(c => c.seq === s[k - 1]), b = COMPASES.find(c => c.seq === s[k]);
      assert.notEqual(a.move, b.move, 'dos compases seguidos no pueden ser la misma maniobra');
    }
  }
});

test('pulso: las zonas arrancan con teclas distintas (elegir es teclear)', () => {
  // El primer toque ELIGE el carril: si dos zonas empezaran igual, la eleccion seria ambigua y el
  // jugador terminaria en una zona que no queria.
  const z = armarZonas(PULSO_ZONAS, poolFor({ campaign: false }), 0.5);
  assert.equal(z.length, PULSO_ZONAS.length);
  const firsts = z.map(o => o.seqs[0][0]);
  assert.equal(new Set(firsts).size, firsts.length, `las zonas arrancan igual: ${firsts.join('')}`);
});

// ---------------- EL PULSO: el premio (Q3) ----------------
// Mismo motivo que la escalada: un premio desbalanceado no da error, solo paga de mas o de menos,
// y eso se descubre recien mirando el recuento de diez misiones.

test('pulso: el par de velocidad sale del margen vigente, no de un numero fijo', () => {
  // asi el sello es igual de alcanzable en la primera mision (margen holgado) que en la ultima
  const facil = parSecsFor(3, beatFor(0, 0)), duro = parSecsFor(3, beatFor(1, 0));
  assert.ok(facil > duro, 'con menos margen, el par tiene que ser mas corto');
  near(facil / (3 * beatFor(0, 0)), PULSO_PREMIO.PAR);
  assert.equal(parSecsFor(0, 2), 0);
  assert.ok(parSecsFor(-2, -2) >= 0, 'no puede haber un par negativo');
});

test('pulso: los tres sellos miden tres cosas distintas', () => {
  const brava = PULSO_ZONAS.find(z => z.bars > 0), facil = PULSO_ZONAS.find(z => z.bars < 0);
  const s = sellosDe({ errs: 0, secs: 1, par: 3, zona: brava });
  assert.deepEqual(s, { limpio: true, rapido: true, bravo: true });
  assert.equal(sellosN(s), 3);
  // un error se lleva SOLO el sello limpio: los otros dos se ganaron y no se pierden
  const conErr = sellosDe({ errs: 1, secs: 1, par: 3, zona: brava });
  assert.deepEqual(conErr, { limpio: false, rapido: true, bravo: true });
  // llegar justo en el par cuenta como rapido; pasarse, no
  assert.equal(sellosDe({ errs: 0, secs: 3, par: 3, zona: facil }).rapido, true);
  assert.equal(sellosDe({ errs: 0, secs: 3.01, par: 3, zona: facil }).rapido, false);
  assert.equal(sellosDe({ errs: 0, secs: 1, par: 3, zona: facil }).bravo, false, 'la zona facil no da sello de brava');
  // sin datos no puede inventar sellos que no se ganaron (salvo `limpio`, que es no haber errado)
  assert.deepEqual(sellosDe({}), { limpio: true, rapido: false, bravo: false });
});

test('pulso: el premio paga la zona y la suman los sellos', () => {
  const brava = PULSO_ZONAS.find(z => z.bars > 0), facil = PULSO_ZONAS.find(z => z.bars < 0);
  const nada = { limpio: false, rapido: false, bravo: false };
  assert.equal(puntosDe(brava, nada), brava.pts, 'sin sellos se paga la base de la zona y nada mas');
  assert.ok(puntosDe(brava, nada) > puntosDe(facil, nada) * 2, 'la zona brava tiene que pagar el doble largo');
  const todo = { limpio: true, rapido: true, bravo: true };
  assert.ok(puntosDe(facil, todo) < puntosDe(brava, nada),
    'una perfecta en la zona facil no puede pagar mas que una sucia en la brava: elegir es el riesgo');
  near(puntosDe(brava, todo) / brava.pts, 1 + PULSO_PREMIO.LIMPIO + PULSO_PREMIO.RAPIDO + PULSO_PREMIO.BRAVO);
  assert.equal(puntosDe(null, todo), 0, 'sin zona no hay premio (y no puede reventar)');
});

test('pulso: cada clase de buque se muere distinto', () => {
  // el criterio de cierre de Q3 pide que dos cinematicas no se confundan: si dos clases (o dos
  // zonas) tuvieran los mismos numeros, seria la misma cinematica con otro nombre
  const cl = Object.values(PULSO_CLASE);
  assert.equal(new Set(cl.map(c => c.sink + '/' + c.humo)).size, cl.length);
  assert.equal(new Set(cl.map(c => c.str)).size, cl.length, 'cada clase tiene su propia linea');
  const zs = PULSO_ZONAS;
  assert.equal(new Set(zs.map(z => z.hitV + '/' + z.humo + '/' + z.sink)).size, zs.length,
    'dos zonas con la misma cinematica: elegir blanco dejaria de significar algo');
  assert.equal(new Set(zs.map(z => z.muerte)).size, zs.length);
  // el polvorin es la UNICA con segundo estallido: es lo que lo hace la zona brava
  assert.deepEqual(zs.filter(z => z.sec).map(z => z.id), ['deposit']);
  // y el impacto de cada zona esta a distinta altura: arriba el mastil, abajo la flotacion
  assert.ok(zs[0].hitV < zs[1].hitV && zs[1].hitV < zs[2].hitV);
});

// ---------- EL CATALOGO DEL MODO PRUEBAS (COMO_PROBAR §4, PR0) ----------
// El catalogo se lee como DATA, y eso hay que poder afirmarlo sin abrir una ventana: si una
// entrada perdiera su `setup` o dos compartieran `id`, el menu se rompe recien al elegir la fila
// — que es justo el momento en el que uno esta probando OTRA cosa.
test('pruebas: el catalogo es data bien formada', () => {
  const ids = momentos().map(m => m.id);
  assert.ok(ids.length >= 15, 'el catalogo tiene que cubrir la lista de momentos dificiles del §3');
  assert.equal(new Set(ids).size, ids.length, 'ids repetidos: el fixture no podria nombrar el momento');
  for (const m of momentos()) {
    assert.equal(typeof m.setup, 'function', `${m.id} sin setup`);
    assert.ok(m.titulo && m.desc, `${m.id} sin titulo o descripcion`);
    // sin acentos ni Ñ: la tipografia del menu no los tiene (misma regla que el resto de la UI)
    assert.ok(!/[áéíóúÁÉÍÓÚñÑ]/.test(m.titulo + m.desc), `${m.id} tiene acentos`);
  }
  // ATRAS es la ultima fila y NO es un momento: una lista sin salida a la vista parece un callejon
  assert.ok(PRUEBAS[PRUEBAS.length - 1].back);
  assert.ok(PRUEBAS.some(r => r.head), 'el catalogo va por secciones');
});

// El `setup` de cada momento NO puede hacer nada por su cuenta: solo llamar verbos de la api. Se
// corre con una api espia, que es la unica forma de comprobar la REGLA DE ORO (§4, "PRUEBAS es una
// interfaz sobre las sondas") sin arrancar el juego. Si alguien mete logica de juego en un setup,
// se cae aca y no tres semanas despues cuando el catalogo diverja del juego real.
test('pruebas: ningun momento tiene logica propia — todos llaman a la capa de sondas', () => {
  const VERBOS = ['mision', 'patria', 'persec', 'arena', 'pasada', 'pulso', 'escena', 'recarga', 'luego', 'sonda', 'cfg'];
  for (const m of momentos()) {
    const llamadas = [];
    const espia = {};
    for (const v of VERBOS) espia[v] = (...a) => { llamadas.push(v); if (v === 'luego') a[1](espia); };
    m.setup(espia);
    assert.ok(llamadas.length, `${m.id}: el setup no llamo a la api`);
    // todo momento tiene que ARRANCAR algo: una sonda suelta sin destino no lleva a ningun lado
    assert.ok(llamadas.some(v => ['mision', 'patria', 'persec', 'arena', 'pasada', 'pulso', 'escena', 'recarga'].includes(v)),
      `${m.id}: el setup no abre ninguna puerta (mision/climax/escena)`);
  }
});

// ---------- TRAMOS: el guion de spawn por mision (SPEC_TRAMOS RF-01) ----------
// La resolucion es PURA y por eso se prueba aca, en node pelado y sin abrir una ventana: es la
// unica capa donde se puede afirmar que las FRACCIONES caen donde tienen que caer. Todo lo demas
// del item (sembrado, radio) depende de que esta tabla de bordes este bien.
import { tramoAt, validarTramos, CLAVES } from '../src/core/tramos.js';

const T3 = [
  { hasta: 0.3, obstacles: 0.3, caza: 0, radio: 'r1' },
  { hasta: 0.85, obstacles: 1.2, caza: 1 },
  { hasta: 1, obstacles: 1.8, favor: ['radar'] },
];

test('tramos: sin tramos, sin objetivo o pasado el ultimo hasta devuelve null (= cfg plano)', () => {
  // null NO es un error: es "aca manda el cfg de siempre", que es como se cumple RF-04 (una
  // mision sin tramos se comporta exactamente igual que hoy).
  assert.equal(tramoAt(500, 2600, undefined), null, 'mision sin tramos');
  assert.equal(tramoAt(500, 2600, []), null, 'lista vacia');
  assert.equal(tramoAt(500, 0, T3), null, 'sin objetivo (POR LA PATRIA) no hay tramos');
  // una lista que no llega a 1: el resto del vuelo es cfg plano, y es deliberado (§2)
  assert.equal(tramoAt(2000, 2600, [{ hasta: 0.5 }]), null, 'pasado el ultimo hasta');
});

test('tramos: los bordes — dist 0, el limite entre dos, y dist = objetivo', () => {
  assert.equal(tramoAt(0, 2600, T3).idx, 0, 'a distancia 0 manda el primero');
  assert.equal(tramoAt(-50, 2600, T3).idx, 0, 'una distancia negativa no puede caerse de la lista');
  // `hasta` es el FINAL del tramo y es EXCLUSIVO: justo en el limite ya manda el siguiente
  assert.equal(tramoAt(2600 * 0.3 - 1, 2600, T3).idx, 0);
  assert.equal(tramoAt(2600 * 0.3, 2600, T3).idx, 1, 'la fraccion exacta del limite es del siguiente');
  assert.equal(tramoAt(2600 * 0.9, 2600, T3).idx, 2);
  // …salvo en el ULTIMO, donde es inclusivo: llegar exacto al objetivo no puede dejar la mision
  // sin tramo en su ultimo cuadro
  assert.equal(tramoAt(2600, 2600, T3).idx, 2, 'dist = objetivo sigue adentro del ultimo tramo');
  assert.equal(tramoAt(2601, 2600, T3), null, 'pasado el objetivo ya no hay tramo');
});

test('tramos: val() lee la clave del tramo y cae al fallback cuando no la trae', () => {
  const t = tramoAt(100, 2600, T3);
  assert.equal(t.val('obstacles', 1.7), 0.3, 'la clave del tramo pisa al cfg');
  assert.equal(t.val('caza', 2), 0, 'un 0 explicito es un valor, no una ausencia');
  assert.equal(t.val('bombs', 1.5), 1.5, 'clave ausente = el cfg de la mision');
  assert.deepEqual(tramoAt(2500, 2600, T3).val('favor', null), ['radar']);
  assert.equal(tramoAt(2500, 2600, T3).val('radio', null), null, 'el ultimo tramo no declara radio');
});

test('tramos: un solo tramo cubre la mision entera', () => {
  const uno = [{ hasta: 1, obstacles: 0.5 }];
  assert.equal(tramoAt(0, 2600, uno).idx, 0);
  assert.equal(tramoAt(2600, 2600, uno).idx, 0);
  assert.equal(tramoAt(1300, 2600, uno).val('obstacles', 9), 0.5);
});

test('tramos: ?qa comprime la mision a metros y las fracciones sobreviven', () => {
  // 2600 m con ?qa son 156. El tramo del transito queda en 47 m — pocos metros, pero SIGUE
  // siendo el tramo 0, que es toda la razon por la que esto se mide en fracciones y no en metros.
  const qa = 2600 * 0.06;
  assert.equal(tramoAt(0, qa, T3).idx, 0);
  assert.equal(tramoAt(qa * 0.29, qa, T3).idx, 0);
  assert.equal(tramoAt(qa * 0.5, qa, T3).idx, 1);
  assert.equal(tramoAt(qa, qa, T3).idx, 2);
});

test('tramos: el validador rechaza lo que no avisaria solo', () => {
  assert.deepEqual(validarTramos(undefined), [], 'una mision sin tramos es valida');
  assert.deepEqual(validarTramos(T3), []);
  // una clave mal escrita no hace NADA y no avisa: es la peor forma de fallar, y por eso el
  // validador la trata como error de datos
  assert.equal(validarTramos([{ hasta: 1, obstaculos: 2 }]).length, 1, 'clave desconocida');
  assert.ok(validarTramos([{ hasta: 0.5 }, { hasta: 0.5 }]).length, 'hasta repetido');
  assert.ok(validarTramos([{ hasta: 0.8 }, { hasta: 0.4 }]).length, 'hasta que retrocede');
  assert.ok(validarTramos([{ hasta: 0 }]).length, 'hasta 0 deja un tramo que no existe');
  assert.ok(validarTramos([{ hasta: 1.4 }]).length, 'hasta mayor que 1');
  assert.ok(validarTramos([{}]).length, 'sin hasta no hay tramo');
  assert.ok(validarTramos([]).length, 'lista vacia: sacala y listo');
  assert.ok(validarTramos([{ hasta: 1, bidones: 'no' }]).length, 'bidones es booleano');
  assert.ok(validarTramos([{ hasta: 1, favor: 'radar' }]).length, 'favor es una lista');
  assert.ok(validarTramos([{ hasta: 1, obstacles: -1 }]).length, 'densidad negativa');
  assert.ok(validarTramos([{ hasta: 1, radio: '' }]).length, 'una radio vacia es una radio muda');
});

test('tramos: TODAS las misiones de la campaña tienen tramos validos', () => {
  // El validador corriendo contra los datos de verdad (RF-01). Es la red que hace que agregar
  // tramos a una mision no pueda salir mal en silencio: se cae aca, en un test de medio segundo,
  // y no volando la mision para descubrir que el tramo del medio nunca se ejecuta.
  for (const m of MISSIONS) {
    const e = validarTramos(m.tramos);
    assert.deepEqual(e, [], `${m.id}: ${e.join(' · ')}`);
  }
  assert.ok(CLAVES.includes('hasta') && CLAVES.includes('radio'));
});

// ---------- EL LOADOUT DE REFERENCIA (data/upgrades.js, el selector "real real") ----------
// Con que piruetas se vuela una mision suelta. Se prueba aca y no a ojo porque si la cuenta se
// corre en uno, el selector mide OTRO avion que el de la campaña — y eso no da error: da una
// pirueta que sale (o no) cuando no debia, que es justo lo que las notas de playtest van a acusar.
const { loadoutAt: loadAt, UPGRADES: UPS } = await import('../src/data/upgrades.js');
const { MISSIONS: MIS } = await import('../src/data/missions.js');

test('libreta: la primera mision se vuela SIN mejoras', () => {
  // El tutorial es el avion de fabrica: el guion no le regalo nada todavia.
  assert.deepEqual(loadAt(0), []);
});

test('libreta: se gana UNA por mision, en el orden causal del guion', () => {
  assert.deepEqual(loadAt(1), [UPS[0].id]);
  assert.deepEqual(loadAt(3), [UPS[0].id, UPS[1].id, UPS[2].id]);
  for (let i = 0; i <= MIS.length; i++) assert.equal(loadAt(i).length, Math.min(i, UPS.length));
});

test('libreta: al final de la campaña queda UNA sin aprender', () => {
  // 12 mejoras y 11 ventanas (una por epilogo mientras haya mision siguiente): la cuenta del
  // guion — "una queda sin aprender por partida" — tiene que cerrar sola.
  const ultima = loadAt(MIS.length - 1);
  assert.equal(ultima.length, MIS.length - 1);
  assert.ok(ultima.length < UPS.length, 'la campaña no puede regalar las doce');
});

test('libreta: nunca desborda ni devuelve basura', () => {
  assert.deepEqual(loadAt(-5), []);
  assert.equal(loadAt(999).length, UPS.length);
  for (const id of loadAt(999)) assert.ok(UPS.some(u => u.id === id), `id desconocido: ${id}`);
});

test('libreta: es un ARRAY NUEVO cada vez (nadie puede ensuciar el catalogo)', () => {
  // `pichon` se muta al elegir en el banco: si loadoutAt devolviera una vista del catalogo, una
  // partida le agregaria mejoras a UPGRADES y la siguiente arrancaria con ellas.
  const a = loadAt(3); a.push('intruso');
  assert.equal(loadAt(3).length, 3);
  assert.equal(UPS.length, 12);
});

// ---------------- EL DIRECTOR: el calendario de una cinematica (core/cine.js) ----------------
// Es la mitad PURA del director (docs/sistemas/PLAN_DIRECTOR_CINEMATICAS.md C0): que beat cae en
// que segundo. Si esto se corre medio segundo, la cinematica no da error — solo se ve mal, y eso
// se descubre mirando. Aca se descubre en un segundo.
// `armar` ya es el de core/pulso.js (arma una secuencia de compases): el del director se importa
// con otro nombre en vez de renombrar ninguno de los dos — cada uno se llama bien en su archivo.
import { lig, armar as armarCine, enVentana, finDe, parteEn, fParte, rampa } from '../src/core/cine.js';
import { CINES, PULSO_D_MUERTE, CINE_VUELO } from '../src/data/cines.js';

test('cine: las ligaduras resuelven lo que solo se sabe jugando', () => {
  assert.equal(lig('$x', { x: 7 }), 7);
  assert.equal(lig(7, {}), 7, 'lo que no es ligadura pasa tal cual');
  assert.equal(lig('negro', {}), 'negro', 'un string comun no es una ligadura');
  assert.equal(lig('$x', {}), undefined, 'sin atar, no inventa un valor');
  assert.equal(lig('$x', undefined), undefined);
});

test('cine: un beat sin instante NO ocurre (asi se escribe "esto pasa a veces")', () => {
  const tl = { beats: [{ t: 0, parte: 'a' }, { t: '$tSec', marca: 'sec' }, { t: 2, fin: true }] };
  assert.equal(armarCine(tl, {}).length, 2, 'sin ligar, el beat opcional no se agenda');
  assert.equal(armarCine(tl, { tSec: 1 }).length, 3, 'ligado, ocurre');
  // …y queda ORDENADO por instante aunque se haya escrito al final (que es lo legible en data)
  assert.deepEqual(armarCine(tl, { tSec: 1 }).map(b => b.t), [0, 1, 2]);
  // basura no se cuela como instante
  assert.equal(armarCine({ beats: [{ t: 'ya' }, { t: NaN }, { t: Infinity }] }, {}).length, 0);
});

test('cine: la ventana de disparo no repite ni pierde beats', () => {
  const b = armarCine({ beats: [{ t: 0 }, { t: 0.5 }, { t: 1 }, { t: 2 }] }, {});
  // (t0, t1]: abierta abajo, cerrada arriba
  assert.equal(enVentana(b, -1e-6, 0).length, 1, 'el beat en cero dispara en el primer cuadro');
  assert.equal(enVentana(b, 0, 0.5).length, 1);
  assert.equal(enVentana(b, 0.5, 0.5).length, 0, 'un cuadro sin avance no re-dispara');
  // un dt grande (una pestaña que vuelve del fondo) trae varios juntos: la cinematica se pone al
  // dia en vez de saltearse beats
  assert.equal(enVentana(b, 0, 2).length, 3);
  // ningun beat se dispara dos veces recorriendo la timeline en pasos chicos. Las ventanas van
  // PEGADAS (el t0 de una es el t1 de la anterior, sin holgura): con cualquier solapamiento, un
  // beat que cae justo en el borde suena dos veces — que en una cinematica es un eco.
  let n = 0, prev = -1e-6;
  for (let t = 0; t <= 3; t += 1 / 60) { n += enVentana(b, prev, t).length; prev = t; }
  assert.equal(n, 4, `cada beat una sola vez (dispararon ${n} de 4)`);
});

test('cine: partes, avance y fin', () => {
  const b = armarCine({ beats: [{ t: 0, parte: 'a' }, { t: 1, parte: 'b' }, { t: 3, fin: true }] }, {});
  assert.equal(finDe(b), 3);
  assert.equal(parteEn(b, 0.5).id, 'a');
  assert.equal(parteEn(b, 1).id, 'b', 'la parte cambia EN su instante, no despues');
  assert.equal(parteEn(b, -1), null, 'antes de la primera parte no hay parte');
  // el avance de la ultima parte se mide contra el FIN de la timeline
  assert.equal(fParte(parteEn(b, 2), 2), 0.5);
  assert.equal(fParte(parteEn(b, 9), 9), 1, 'pasado el fin no se pasa de 1');
  assert.equal(fParte(null, 1), 0);
  // sin beat `fin`, el fin es el ultimo beat que haya
  assert.equal(finDe(armarCine({ beats: [{ t: 0 }, { t: 4 }] }, {})), 4);
  assert.equal(finDe([]), 0);
});

test('cine: las rampas entran y salen donde deben', () => {
  assert.equal(rampa(0, 1, 2, 0), 0);
  assert.equal(rampa(0, 1, 2, 1), 0.5);
  assert.equal(rampa(0, 1, 2, 5), 1, 'pasada la duracion se queda en el destino');
  assert.equal(rampa(0, 1, 0, 0), 1, 'sin duracion es un corte, no una rampa');
});

test('cine: las curvas de las rampas entran y salen distinto', () => {
  // 'lineal' es el default y NO cambia nada de lo que ya estaba escrito en data — esa es la
  // condicion para poder agregar curvas sin repasar las timelines existentes
  assert.equal(rampa(0, 1, 2, 1), 0.5);
  assert.equal(rampa(0, 1, 2, 1, 'lineal'), 0.5);
  assert.equal(rampa(0, 1, 2, 1, 'suave'), 0.5, 'la mitad es la mitad en todas: cambia el CAMINO');
  assert.ok(rampa(0, 1, 2, 0.5, 'entra') < 0.25, 'entra: arranca despacio');
  assert.ok(rampa(0, 1, 2, 0.5, 'sale') > 0.25, 'sale: arranca rapido y se asienta');
  assert.ok(rampa(0, 1, 2, 0.2, 'suave') < rampa(0, 1, 2, 0.2, 'lineal'), 'suave sale de cero sin golpe');
  // los extremos son sagrados: una curva no puede pasarse ni quedarse corta
  for (const e of ['lineal', 'suave', 'entra', 'sale']) {
    assert.equal(rampa(0, 1, 2, 0, e), 0);
    assert.equal(rampa(0, 1, 2, 2, e), 1);
    assert.equal(rampa(0, 1, 2, 9, e), 1);
  }
  assert.equal(rampa(0, 1, 2, 1, 'noexiste'), 0.5, 'una curva que no existe cae a lineal, no rompe');
});

test('cine: el premio del PULSO compone en orden y solo la zona brava vuela dos veces', () => {
  // el criterio de cierre de C0 leido en la data: la cinematica del PULSO es una timeline, y esto
  // la lee sin abrir el juego
  // los instantes se miden DESDE que termina la pirueta (`$tPir` = encare + duracion de LA
  // maniobra que se tecleo), asi que la timeline se liga con eso y no con tiempos absolutos
  const tPir = CINE_VUELO.POSE_T + 0.7;      // encare + un BREAK TURN
  const vars = { pirueta: 'breakt', piruetaDir: 1, boom: 1, shake: 6, tPir, muerteDur: 2.6 };
  const partes = b => b.filter(x => x.parte).map(x => x.parte);
  const facil = armarCine(CINES.pulso_premio, vars);
  assert.deepEqual(partes(facil), ['pirueta', 'suelta', 'impacto', 'muerte']);
  assert.equal(+finDe(facil).toFixed(2), +(tPir + PULSO_D_MUERTE + 2.6).toFixed(2),
    'el final = fin de la pirueta + los compases fijos + la agonia que estira la clase');
  assert.equal(facil.filter(b => b.marca === 'sec').length, 0, 'sin santabarbara no hay segundo estallido');
  const brava = armarCine(CINES.pulso_premio, Object.assign({ secOff: 0.55 }, vars));
  assert.equal(brava.filter(b => b.marca === 'sec').length, 1);
  // …y estalla DENTRO de la agonia, no antes de que el buque empiece a morirse
  const sec = brava.find(b => b.marca === 'sec');
  assert.ok(sec.t > tPir + PULSO_D_MUERTE && sec.t < finDe(brava));
  // la pirueta es la que se tecleo, y el rotulo de respaldo solo existe cuando no hay ninguna
  assert.equal(facil.find(b => b.move).move, 'breakt');
  assert.equal(facil.filter(b => b.rotulo).length, 0);
  assert.equal(armarCine(CINES.pulso_premio, { tSinPirueta: 0, tPir: 0.4, muerteDur: 2.6 }).filter(b => b.rotulo).length, 1,
    'sin piruetas aprendidas el premio se rotula: el examen era soltar');
});
