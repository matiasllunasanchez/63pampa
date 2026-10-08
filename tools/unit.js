// TESTS UNITARIOS de la fisica de vuelo (node:test, que viene con Node — sin dependencias).
//   npm run unit
//
// A diferencia de feeltest.js, que simula corridas completas y reporta la SENSACION, esto prueba
// las funciones sueltas en sus casos de borde: los que en el juego son dificiles de provocar y
// justo donde suelen romperse las cosas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
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
  RELEVO_WRECK, RELEVO_GRACE, RELEVO_DUR, naftaCompanero,
  alMando, detras, filaOk, filaDeVidas } from '../src/core/squad.js';

test('relevo: el compañero venia ahorrando — entra con MAS que el lider, nunca lleno', () => {
  assert.equal(naftaCompanero(0), 40, 'el que se seco deja un compañero con 40 %');
  assert.equal(naftaCompanero(100), 100);
  for (const f of [0, 10, 50, 90]) assert.ok(naftaCompanero(f) > f && naftaCompanero(f) < 100);
});

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

// EL GIRO LIBRE ([Q]/[E]) YA NO GIRA EL MUNDO (autor, 4/10: "que solo gire el avion"): lo rola el dibujo
// del avion (render/plane.js) y `horizonRoll` no lo cuenta en ningun modo.
test('horizonte: el giro libre NO gira el mundo, en ningun modo', () => {
  assert.equal(horizonRoll(HZ_MOVES, 0, 0, 4), 0);
  assert.equal(horizonRoll(HZ_ALL, 0, 0, 4), 0);
  assert.equal(horizonRoll(HZ_FREE, 0, 0, Math.PI), 0, 'boca abajo a voluntad: el mundo sigue derecho');
  near(horizonRoll(HZ_FREE, 1, 0, 2), -1);                     // la pirueta si, el giro libre no
});

test('horizonte: en LIBRE el banqueo sigue sumando; en pirueta no', () => {
  near(horizonRoll(HZ_FREE, 0, 1, Math.PI), -BANK_TILT);
  near(horizonRoll(HZ_FREE, 0.5, 1, Math.PI), -0.5);           // la pirueta anula el banqueo
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
        sceneFromScreen, splitSpeaker, seqFromScreens, autoSecs, TYPE_CPS, HOLD_MAX } = dlgMod;
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

test('historia: el hold no se puede saltear, y dura lo que dice hasta el techo (RF-07)', () => {
  // La linea 010 pide 2.0 s y el techo (HOLD_MAX) los recorta: lo que NO cambia es que mientras
  // corre el silencio el toque se ignora, que es la regla que RF-07 protege.
  locker();
  const espera = Math.min(2.0, HOLD_MAX);
  pressDialogue();                                   // completa la linea 010 (hold 2.0)
  assert.equal(canAdvance(), false, 'apenas termina de tipearse ya esta en silencio');
  near(holdLeft(), espera, 1e-9);
  run60(espera - 0.1);
  assert.equal(pressDialogue(), null, 'el toque se IGNORA mientras corre el hold');
  assert.equal(dlg.li, 0);
  assert.ok(holdLeft() > 0);
  run60(0.12);                                       // pasado el silencio
  assert.equal(holdLeft(), 0);
  assert.equal(canAdvance(), true);
  assert.equal(pressDialogue(), 'next');
  assert.equal(dlg.li, 1);
});

test('historia: el silencio del Vasco lo recorta el TECHO, y el guion lo sigue pidiendo entero', () => {
  // Este test cambio a proposito (19/8/2026). Antes exigia los 4.0 s clavados del spec §6 — "el
  // silencio ES la escena" —; jugado, esa espera se sentia muerta y el autor puso techo de
  // HOLD_MAX. Lo que se prueba ahora son las DOS mitades de esa decision: que en pantalla se
  // respeta el techo, y que el DATO del guion sigue diciendo 4.0 (la intencion del director no se
  // borro — subir HOLD_MAX la devuelve intacta).
  const linea = SCENES.M07_LOCKER.lineas[4];
  assert.equal(linea.hold, 4.0, 'el guion tiene que seguir pidiendo sus 4 segundos');
  locker();
  for (let i = 0; i < 4; i++) { pressDialogue(); dlg.t += 99; stepDialogue(0); pressDialogue(); }
  assert.equal(dlg.li, 4, 'estamos en la linea del Vasco');
  assert.equal(txtOf(line()), 'El Vasco tenía quince años.');
  pressDialogue();                                   // completar el tipeo
  let s = 0;
  while (pressDialogue() === null && s < 10) { stepDialogue(1 / 60); s += 1 / 60; }
  assert.ok(Math.abs(s - HOLD_MAX) < 1 / 30, `el silencio duro ${s.toFixed(3)} s, el techo es ${HOLD_MAX}`);
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

// ---------- INTEGRIDAD / MODELOS DE SALUD (src/core/damage.js) ----------
// La regla que sostiene todo el sistema: te DISPARAN → daño; CHOCAS algo → muerte, en los tres
// modos. Si esto se afloja, el rasante deja de tener consecuencias y el juego cambia de genero.
// (El ROCE con el agua ya no entra en "chocar": desde el 11/9, con chapa, pasa por el ESCUDO —
// ver los tests de escudo, abajo. La cara de una ola, un mastil o una barranca siguen matando.)
import { applyHit, effects, tierOf, isFatal, DMG_MODES, DMG, absorber, dmgRoce, recargar, ESCUDO } from '../src/core/damage.js';
import { scrapeLimit as limRoce } from '../src/core/physics.js';

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

// EL ESCUDO (11/9): la amarilla para todo el daño antes de la chapa, y vuelve sola; la blanca no.
test('escudo: para primero, y a la chapa pasa solo lo que sobra', () => {
  const a = absorber(1, 100, DMG.death_gunfire);
  assert.equal(a.integ, 100, 'una trazadora con el escudo lleno no toca la chapa');
  assert.ok(a.escudo > 0 && a.escudo < 1);
  const b = absorber(a.escudo, a.integ, DMG.death_aa);
  assert.ok(Math.abs(b.aChapa - (DMG.death_aa - (ESCUDO.pts - DMG.death_gunfire))) < 1e-9,
    'lo que no cabe en el escudo va a la chapa: ' + b.aChapa);
  assert.equal(b.escudo, 0);
  assert.equal(absorber(0, 10, DMG.death_missile).down, true, 'sin escudo y con poca chapa, un misil te baja');
});

test('escudo: el agua pega mas que una bala, a cualquier velocidad', () => {
  for (let spd = 60; spd <= 340; spd += 20) for (const boost of [false, true]) {
    const lim = limRoce(spd, boost);
    assert.ok(dmgRoce(1, lim) > DMG.death_gunfire, `un segundo de roce a ${spd} tiene que costar mas que una trazadora`);
    assert.ok(Math.abs(dmgRoce(lim, lim) - ESCUDO.pts) < 1e-9, 'el escudo entero dura justo el margen de roce de siempre');
  }
});

test('escudo: vuelve solo despues de la demora', () => {
  let e = 0, q = ESCUDO.demora, t = 0;
  while (e < 1 && t < 20) { const r = recargar(e, q, 0.05); e = r.escudo; q = r.quieto; t += 0.05; }
  assert.equal(e, 1);
  assert.ok(Math.abs(t - (ESCUDO.demora + ESCUDO.llenar)) < 0.15, 'demora + llenado: ' + t.toFixed(2) + ' s');
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
import { MISSIONS, climaxOf, climaxDeclarado } from '../src/data/missions.js';
import { CLIMAX_EN_CUARENTENA, CLIMAX_SUPLENTE, MODOS_EN_CUARENTENA, climaxEnCuarentena, modoEnCuarentena } from '../src/data/cuarentena.js';

test('climax: es DATO de la mision (RF-14), y eso lo sigue diciendo el DECLARADO', () => {
  // El criterio de aceptacion de RF-14, literal: cambiar el campo cambia el climax sin tocar
  // codigo. Se prueba con misiones inventadas y no solo con las de la campaña.
  // OJO: se prueba contra `climaxDeclarado` y no contra `climaxOf`, porque desde la cuarentena
  // (PLAN_REFACTOR §4b) son dos preguntas distintas — que PIDE la mision, y que se JUEGA hoy.
  assert.equal(climaxDeclarado({ goal: { kind: 'ship' } }), 'pasada', 'sin campo, una mision con buque pide la PASADA');
  assert.equal(climaxDeclarado({ goal: { kind: 'ship' }, climax: 'arena' }), 'arena');
  assert.equal(climaxDeclarado({ goal: { kind: 'distance' } }), null, 'sin buque no hay climax: la cierra el PASILLO');
  assert.equal(climaxDeclarado({ goal: { kind: 'distance' }, climax: 'arena' }), null, 'el campo no le inventa un buque');
  assert.equal(climaxDeclarado({ goal: { kind: 'ship' }, climax: 'pulso' }), 'pulso');
});

test('cuarentena: lo apartado juega el suplente, y el dato del autor queda INTACTO debajo', () => {
  // EL CUSTODIO DE RF-A. La cuarentena tiene que ser reversible con un renglon de dato: si
  // alguien "arregla" esto pisando data/missions.js, la vuelta deja de existir y nadie se
  // acuerda de que misiones pedian que. Estos asserts son los que no lo dejan pasar.
  for (const c of CLIMAX_EN_CUARENTENA) {
    assert.equal(climaxOf({ goal: { kind: 'ship' }, climax: c }), CLIMAX_SUPLENTE, `${c} esta apartado: juega el suplente`);
    assert.equal(climaxDeclarado({ goal: { kind: 'ship' }, climax: c }), c, `${c} SIGUE declarado: la cuarentena no pisa el dato`);
  }
  assert.ok(!climaxEnCuarentena(CLIMAX_SUPLENTE), 'el suplente no puede estar el mismo apartado');
  assert.equal(climaxOf({ goal: { kind: 'distance' }, climax: 'arena' }), null, 'sin buque sigue sin haber climax');
  // el suplente pasa derecho: una mision que ya pedia PULSO no se toca
  assert.equal(climaxOf({ goal: { kind: 'ship' }, climax: 'pulso' }), 'pulso');
});

test('cuarentena: HOY no queda ninguna mision jugando algo apartado', () => {
  const conBuque = MISSIONS.filter(m => m.goal.kind === 'ship');
  assert.ok(conBuque.length > 0, 'la campaña tiene misiones con buque');
  assert.ok(conBuque.every(m => !climaxEnCuarentena(climaxOf(m))), 'ninguna mision entra a un climax apartado');
  assert.equal(MISSIONS.filter(m => m.goal.kind !== 'ship').every(m => climaxOf(m) === null), true);
  // y los modos apartados no pueden ser cualquier cosa: los dos que el plan nombra, y la PERSECUCION
  // desde el 4/10 (autor: "no funciona bien y no queda claro")
  assert.deepEqual([...MODOS_EN_CUARENTENA].sort(), ['arena', 'pasadas', 'persec'], 'los modos apartados son MINUTOS SAGRADOS, PASADAS MORTALES y PERSECUCION');
  assert.ok(modoEnCuarentena('arena') && modoEnCuarentena('pasadas') && !modoEnCuarentena('cycle'));
});

test('climax: la campaña respeta la regla del autor — la mayoria PASADA, el ARENA ocasional', () => {
  // Se mide sobre lo DECLARADO: la cuarentena aparta el climax, no borra el diseño. El dia que
  // se levante, la campaña tiene que volver exactamente a esto sin que nadie reconstruya nada.
  const conBuque = MISSIONS.filter(m => m.goal.kind === 'ship');
  const arena = conBuque.filter(m => climaxDeclarado(m) === 'arena');
  assert.ok(conBuque.every(m => ['pasada', 'arena', 'pulso'].includes(climaxDeclarado(m))), 'ningun climax desconocido');
  assert.ok(arena.length * 2 < conBuque.length, 'el ARENA tiene que ser la excepcion, no la regla');
  // m5 y m14 desde el guion 3.0: el callejon de San Carlos y el final. Eran m4 y m12 con las
  // doce misiones viejas — el renumerado los corrio un lugar cada uno, no cambio la decision.
  assert.deepEqual(arena.map(m => m.id), ['m5', 'm14'], 'el callejon de San Carlos y el final');
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
import { beatFor, barsFor, errFor, poolFor, armar,
  parSecsFor, sellosDe, puntosDe, sellosN } from '../src/core/pulso.js';
import { PULSO, PULSO_PREMIO, PULSO_CLASE, COMPASES, PULSO_IMPACTO, POOL_BASICO } from '../src/data/pulso.js';

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

// EL TEST DE LAS TRES ZONAS SE BORRO (15/9). Medía que cada zona arrancara con una tecla distinta
// —porque el primer toque elegia el carril— y la zona se fue del juego entera: no hay carriles ni
// eleccion. La secuencia es una sola y la arma `armar`, que sigue probado arriba.

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

test('pulso: los dos sellos miden dos cosas distintas', () => {
  // ERAN TRES: el tercero premiaba haber elegido la zona brava, y se fue con la zona (15/9) — no
  // se puede premiar una decision que el jugador ya no toma. Quedan los dos que miden LA MANO.
  const s = sellosDe({ errs: 0, secs: 1, par: 3 });
  assert.deepEqual(s, { limpio: true, rapido: true });
  assert.equal(sellosN(s), 2);
  // un error se lleva SOLO el sello limpio: el otro se gano y no se pierde
  assert.deepEqual(sellosDe({ errs: 1, secs: 1, par: 3 }), { limpio: false, rapido: true });
  // llegar justo en el par cuenta como rapido; pasarse, no
  assert.equal(sellosDe({ errs: 0, secs: 3, par: 3 }).rapido, true);
  assert.equal(sellosDe({ errs: 0, secs: 3.01, par: 3 }).rapido, false);
  // sin datos no puede inventar sellos que no se ganaron (salvo `limpio`, que es no haber errado)
  assert.deepEqual(sellosDe({}), { limpio: true, rapido: false });
});

test('pulso: el premio paga una base y la suman los sellos', () => {
  const base = PULSO_IMPACTO.pts;
  const nada = { limpio: false, rapido: false };
  assert.equal(puntosDe(base, nada), base, 'sin sellos se paga la base y nada mas');
  const todo = { limpio: true, rapido: true };
  near(puntosDe(base, todo) / base, 1 + PULSO_PREMIO.LIMPIO + PULSO_PREMIO.RAPIDO);
  assert.ok(puntosDe(base, todo) > puntosDe(base, nada), 'los sellos tienen que pagar');
  assert.equal(puntosDe(0, todo), 0, 'sin base no hay premio (y no puede reventar)');
  assert.equal(puntosDe(null, todo), 0);
});

test('pulso: cada clase de buque se muere distinto', () => {
  // El criterio de cierre de Q3 pide que dos cinematicas no se confundan. Media tambien que las
  // TRES ZONAS dieran tres muertes distintas; la zona se fue el 15/9 y la variedad se mudo a la
  // ranura MUERTE del catalogo de remates. Lo que queda aca es la clase del buque, que sigue
  // decidiendo cuanto arde, cuanto tarda y con que frase se muere.
  const cl = Object.values(PULSO_CLASE);
  assert.equal(new Set(cl.map(c => c.sink + '/' + c.humo)).size, cl.length);
  assert.equal(new Set(cl.map(c => c.str)).size, cl.length, 'cada clase tiene su propia linea');
  // …y el impacto es UNO SOLO, con sus numeros puestos: si alguno se fuera a cero, la cinematica
  // se quedaria sin fuego y sin estallido sin dar un solo error.
  assert.ok(PULSO_IMPACTO.blast > 0 && PULSO_IMPACTO.humo > 0 && PULSO_IMPACTO.pts > 0);
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

// LO QUE EL DESPEGUE SE COME. `run.dist` acredita durante `'takeoff'`, asi que al llegar a `'play'`
// el odometro ya marca ~155 m: un tramo que TERMINA antes de eso empieza y termina adentro de la
// carrera y nunca llega a ser vigente. Si trae `charla:` o `radio:`, esa linea no se dice — y no
// falla nada: la mision se juega sin ella y nadie se entera. Le pasaba a M01_OBJETIVO (132 m),
// M04_OBJETIVO (104 m) y M05_OBJETIVO (130 m). Ver SPEC_TRAMOS §8 divergencia 14.
//
// EL NUMERO ES MEDIDO, no deducido: 153-154 m en las catorce misiones (la carrera dura 3 s y la
// velocidad la fija `spdBase0` en game.js). Se guarda con margen — lo que se quiere atajar es un
// tramo que cae ADENTRO, no uno que roza el borde.
const DESPEGUE_M = 155;
test('tramos: ningun tramo que hable termina adentro de la carrera de despegue', () => {
  for (const m of MISSIONS) {
    const obj = m.goal.kind === 'ship' ? m.goal.dist : m.goal.meters;
    for (const t of m.tramos || []) {
      if (!t.charla && !t.radio) continue;
      const fin = t.hasta * obj;
      assert.ok(fin > DESPEGUE_M,
        `${m.id}: el tramo de '${t.charla || t.radio}' termina a los ${Math.round(fin)} m y el `
        + `despegue llega a ${DESPEGUE_M} — esa linea no se dice nunca`);
      break;                      // solo el primero puede caer adentro: los `hasta` van creciendo
    }
  }
});

// ---------- FASES: la forma de una mision entera (PLAN_MISION_CINCO_FASES §11) ----------
// Misma razon que los tramos para probarse aca: la resolucion es PURA, y es la unica capa donde se
// puede afirmar que las fracciones caen donde tienen que caer. Lo que este archivo agrega sobre
// aquel es la HERENCIA DEL TIPO — el escalon del medio entre lo que la fase declara y el cfg — y
// las fracciones MAYORES QUE 1, que son toda la razon por la que las fases existen aparte.
import { faseAt, validarFases, CLAVES as CLAVES_F } from '../src/core/fases.js';
import { TIPOS, TIPOS_VALIDOS } from '../src/data/fases.js';
import { FILO_RADAR, RADAR_ALT as RADAR_ALT_U } from '../src/data/tuning.js';

// la ida sigilosa y la vuelta guerra, en su forma minima: respirar / apretar / atacar / pelear
const F5 = [
  { tipo: 'transito', hasta: 0.25, radio: 'f1' },
  { tipo: 'filo', hasta: 0.45 },
  { tipo: 'rasante', hasta: 0.74 },
  { tipo: 'blanco', hasta: 1 },
  { tipo: 'vuelta', hasta: 1.9 },
];

test('fases: sin fases, sin objetivo o pasada la ultima devuelve null (= cfg plano)', () => {
  // null NO es un error: es "aca manda el cfg de siempre". Es como se cumple la regla suprema —
  // una mision sin `fases` (o sea: las catorce de la campaña) se comporta EXACTAMENTE igual que hoy.
  assert.equal(faseAt(500, 2600, undefined), null, 'mision sin fases');
  assert.equal(faseAt(500, 2600, []), null, 'lista vacia');
  assert.equal(faseAt(500, 0, F5), null, 'sin objetivo (POR LA PATRIA) no hay fases');
  assert.equal(faseAt(2600 * 2, 2600, F5), null, 'pasada la ultima fase: ya aterrizaste');
});

test('fases: LA VUELTA vive pasado el objetivo, que es lo que un tramo no puede hacer', () => {
  // ESTA es la diferencia con los tramos, y la razon de que el item exista aparte: `hasta` pasa
  // de 1. En 1.0 justo todavia manda 'blanco' (el limite es exclusivo); un metro despues del
  // buque ya es la vuelta, y sigue siendolo a lo largo de casi otra mision entera.
  assert.equal(faseAt(2599, 2600, F5).tipo, 'blanco', 'hasta el buque, la corrida final');
  // EN EL OBJETIVO EXACTO YA ES 'vuelta', y no es un borde mal puesto: `hasta` es exclusivo salvo
  // en la ultima fase (la regla de los tramos, sin cambiarla), asi que 'blanco' cubre [0.74, 1) —
  // que es toda la aproximacion — y el instante 1.0 es de la vuelta. Cae justo bien: 1.0 es
  // EXACTAMENTE donde flight.js dispara el climax, y el climax es un estado aparte que no lee
  // fases. Cuando el jugador vuelve al pasillo, ya esta parado en la vuelta sin ningun flanco extra.
  assert.equal(faseAt(2600, 2600, F5).tipo, 'vuelta', 'el objetivo exacto es donde arranca la vuelta');
  assert.equal(faseAt(2600 * 1.5, 2600, F5).tipo, 'vuelta');
  assert.equal(faseAt(2600 * 1.9, 2600, F5).tipo, 'vuelta', 'el ultimo hasta es inclusivo');
});

test('fases: los bordes — dist 0, el limite entre dos, y una distancia negativa', () => {
  assert.equal(faseAt(0, 2600, F5).idx, 0, 'a distancia 0 manda la primera');
  assert.equal(faseAt(-50, 2600, F5).idx, 0, 'una distancia negativa no puede caerse de la lista');
  assert.equal(faseAt(2600 * 0.25 - 1, 2600, F5).tipo, 'transito');
  assert.equal(faseAt(2600 * 0.25, 2600, F5).tipo, 'filo', 'la fraccion exacta del limite es de la siguiente');
});

test('fases: val() lee en TRES escalones — la fase, su tipo, y recien ahi el cfg', () => {
  // el escalon del medio es todo el aporte de este archivo sobre el de tramos: una fase declara
  // `{ tipo: 'filo', hasta: X }` y ya viene con el techo, el silencio y la nafta del filo puestos.
  const filo = faseAt(2600 * 0.3, 2600, F5);
  assert.equal(filo.val('radar', RADAR_ALT_U), FILO_RADAR, 'el default del TIPO pisa al de tuning');
  assert.equal(filo.val('obstacles', 1.7), 0, 'un 0 heredado del tipo es un valor, no una ausencia');
  assert.equal(filo.val('nafta', 1), 2, 'el filo cuesta el doble: es el regimen rasante');

  // …y lo que el tipo NO declara cae hasta el cfg. Es lo que deja que 'rasante' sea literalmente
  // el pasillo de hoy sin repetir la densidad de cada mision que lo use.
  const ras = faseAt(2600 * 0.6, 2600, F5);
  assert.equal(ras.val('obstacles', 1.7), 1.7, 'el rasante no opina de la siembra: manda el cfg');
  assert.equal(ras.val('voces', true), false, 'pero si opina del silencio');

  // y lo que la fase declara explicitamente gana sobre su propio tipo
  const propio = faseAt(10, 2600, [{ tipo: 'filo', hasta: 1, radar: 3.5 }]);
  assert.equal(propio.val('radar', RADAR_ALT_U), 3.5, 'la fase pisa a su tipo');
});

test('fases: ?qa comprime la mision a metros y las fracciones sobreviven', () => {
  // 2600 m con ?qa son 156, y la vuelta cae en 296. Sigue siendo la vuelta, que es toda la razon
  // por la que esto se mide en fracciones y no en metros.
  const qa = 2600 * 0.06;
  assert.equal(faseAt(0, qa, F5).tipo, 'transito');
  assert.equal(faseAt(qa * 0.3, qa, F5).tipo, 'filo');
  assert.equal(faseAt(qa * 1.5, qa, F5).tipo, 'vuelta');
});

test('fases: el validador rechaza lo que no avisaria solo', () => {
  assert.deepEqual(validarFases(undefined), [], 'una mision sin fases es valida');
  assert.deepEqual(validarFases(F5), []);
  // una clave o un tipo mal escritos no hacen NADA y no avisan: es la peor forma de fallar
  assert.ok(validarFases([{ tipo: 'filos', hasta: 1 }]).length, 'tipo desconocido');
  assert.ok(validarFases([{ hasta: 1 }]).length, 'sin tipo no hay de quien heredar');
  assert.ok(validarFases([{ tipo: 'filo', hasta: 1, radares: 4 }]).length, 'clave desconocida');
  assert.ok(validarFases([{ tipo: 'filo', hasta: 0.5 }, { tipo: 'vuelta', hasta: 0.5 }]).length, 'hasta repetido');
  assert.ok(validarFases([{ tipo: 'filo', hasta: 0.8 }, { tipo: 'vuelta', hasta: 0.4 }]).length, 'hasta que retrocede');
  assert.ok(validarFases([{ tipo: 'filo', hasta: 0 }]).length, 'hasta 0 deja una fase que no existe');
  assert.ok(validarFases([{ tipo: 'filo', hasta: 40 }]).length, 'hasta fuera del tope');
  assert.ok(validarFases([]).length, 'lista vacia: sacala y listo');
  assert.ok(validarFases([{ tipo: 'filo', hasta: 1, radar: 0 }]).length, 'un techo en 0 no es un filo: es no poder volar');
  assert.ok(validarFases([{ tipo: 'filo', hasta: 1, voces: 'no' }]).length, 'voces es booleano');
  assert.ok(validarFases([{ tipo: 'filo', hasta: 1, pinta: 'explota' }]).length, 'pinta solo acepta cap|muerte');
  // …y una lista con la vuelta pasando de 1 tiene que ser VALIDA: es el caso de uso del item
  assert.deepEqual(validarFases([{ tipo: 'blanco', hasta: 1 }, { tipo: 'vuelta', hasta: 1.9 }]), []);
});

// LA LISTA DE LAS QUE SI. Era «ninguna mision de campaña declara fases», y funciono como red
// mientras el sistema se construia contra el banco de pruebas. Desde M1_CAMBIOS 5 el tutorial tiene
// IDA Y VUELTA, o sea que la regla no puede ser «ninguna» — pero tampoco «las que sea»: se escribe
// CUALES, y cualquier otra que aparezca sin pasar por aca falla. La red sigue siendo la misma.
const CON_FASES = ['m1'];

test('fases: solo las misiones declaradas las tienen, y todas las listas son validas', () => {
  for (const m of MISSIONS) {
    const declara = m.fases !== undefined;
    assert.equal(declara, CON_FASES.includes(m.id), `${m.id}: fases inesperadas (o faltantes)`);
    const e = validarFases(m.fases);
    assert.deepEqual(e, [], `${m.id}: ${e.join(' · ')}`);
  }
});

test('fases: la mision que las declara tiene VUELTA — si no, no hacia falta la lista', () => {
  for (const id of CON_FASES) {
    const m = MISSIONS.find(x => x.id === id);
    assert.ok(m, `${id} no existe`);
    assert.ok(m.fases[m.fases.length - 1].hasta > 1, `${id}: la ultima fase tiene que pasar de 1`);
  }
});

// ---------- EL BANCO DE PRUEBAS: t15 IDA Y VUELTA (PLAN_MISION_CINCO_FASES §5) ----------
const { MISIONES_PRUEBA } = await import('../src/data/pruebas_misiones.js');
const { SHIPS: SHIPS_T15, CAMPAIGN_CFG } = await import('../src/data/missions.js');
const { STRINGS } = await import('../src/data/strings.js');

test('t15: la mision del banco es valida y NO se coló en la campaña', () => {
  // LA SEPARACION ES LA MITAD DEL ITEM. `MISSIONS` es la campaña: su largo decide cuando termina
  // el juego y es el pool del CICLO DE MUERTE. Si t15 entrara ahi, aparecería sorteada a mitad de
  // una partida de verdad y corrreria el final un renglon.
  assert.equal(MISSIONS.findIndex(m => m.id === 't15'), -1, 't15 no puede estar en la campaña');
  // …y lo mismo para TODO el banco (t16 · LA SUELTA se sumo el 23/9): ninguna de laboratorio en la campaña.
  for (const m of MISIONES_PRUEBA) assert.equal(MISSIONS.findIndex(c => c.id === m.id), -1, m.id + ' no puede estar en la campaña');
  const t15 = MISIONES_PRUEBA.find(m => m.id === 't15');
  assert.ok(t15, 't15 tiene que seguir en el banco');
  const e = validarFases(t15.fases);
  assert.deepEqual(e, [], `t15: ${e.join(' · ')}`);
  // el buque tiene que ser uno de la lista: `useShip` saca de ahi el layout de zonas del climax
  assert.ok(SHIPS_T15.includes(t15.goal.ship), 't15 apunta a un buque que no existe');
});

test('t15: declara las cinco fases del plan, en orden, y la vuelta pasa del buque', () => {
  const t15 = MISIONES_PRUEBA[0];
  const tipos = t15.fases.map(f => f.tipo);
  // LA FORMA, sin ser fragil con las repeticiones: los tramos largos estan PARTIDOS en varias
  // fases del mismo tipo para que Condor tenga donde hablar (una fase suena una sola vez), asi
  // que lo que se afirma es la SECUENCIA DE ETAPAS, colapsando consecutivas iguales.
  const etapas = tipos.filter((t, i) => t !== tipos[i - 1]);
  // (el primer filo se fue el 23/9: con la ruta caia fuera del horizonte de radar)
  assert.deepEqual(etapas, ['transito', 'descenso', 'rasante', 'filo', 'blanco', 'vuelta']);
  // CADA ETAPA MARCADA POR UN DIALOGO. Es la regla que fijo el autor mirando el mapa —"que se
  // marquen las etapas del mapa con dialogos, seguramente sera asi todo"—, y sin esta red una
  // fase nueva se cuela muda y el jugador la cruza sin enterarse de que cambio algo.
  for (const f of t15.fases) assert.ok(f.radio, `la fase '${f.tipo}' (hasta ${f.hasta}) no dice nada`);
  // …Y EL REPARTO DE VOCES ES LA MECANICA DEL SILENCIO. Del descenso al blanco tiene que hablar
  // SOLO Condor: si un dia alguien le pone una linea de PUMA a una fase muda, el efecto entero
  // —que las voces vuelvan en la vuelta— deja de existir, y no lo agarraria ninguna otra prueba.
  // EL DESCENSO QUEDA AFUERA a proposito, y la prueba misma lo enseño: su linea es PUMA
  // DESPIDIENDOSE ("BAJAMOS. DE ACA EN ADELANTE NO SE HABLA"). Es el cierre de la radio del
  // escuadron, no una violacion del silencio — la fase donde empieza es justo la que lo anuncia.
  const mudas = ['rasante', 'blanco'];
  for (const f of t15.fases) {
    if (!mudas.includes(f.tipo)) continue;
    assert.ok(STRINGS.es[f.radio].startsWith('CONDOR'),
      `la fase muda '${f.tipo}' la dice alguien que no es Condor: ${STRINGS.es[f.radio]}`);
  }
  // …y la vuelta las devuelve: su primera linea es del ESCUADRON, no de tierra. Ese contraste es
  // el "pase de lista gratis" del §2 del plan.
  assert.ok(STRINGS.es[t15.fases.find(f => f.tipo === 'vuelta').radio].startsWith('PUMA'),
    'la vuelta tiene que devolver la voz del escuadron');
  // …Y LA VUELTA MIDE LO MISMO QUE LA IDA: es la decision del autor sobre la forma de la mision.
  const vuelta = t15.fases[t15.fases.length - 1];
  assert.equal(vuelta.hasta, 2, 'la vuelta tiene que medir lo mismo que la ida (hasta 2.0)');
  assert.ok(t15.fases[t15.fases.length - 1].hasta > 1, 'la vuelta tiene que vivir pasado el objetivo');
  // EL FILO QUE QUEDA APRIETA MAS QUE EL TIPO: el primero (que enseñaba la banda) se fue el 23/9
  // —con la ruta caia fuera de radar—, y el de la llegada tiene que seguir siendo el mas angosto.
  const filos = t15.fases.filter(f => f.tipo === 'filo');
  const techo = f => faseAt(0, 1, [{ ...f, hasta: 1 }]).val('radar', RADAR_ALT_U);
  assert.equal(filos.length, 1, 'queda un solo filo, pegado al blanco');
  assert.ok(techo(filos[0]) < techo({ tipo: 'filo' }), 'el filo de la llegada tiene que ser mas angosto que el del tipo');
});

test('t15: es una herramienta — sin guion, sin cartas y sin roster de campaña', () => {
  const t15 = MISIONES_PRUEBA[0];
  for (const k of ['story', 'brief', 'epi', 'roster', 'date'])
    assert.equal(t15[k], undefined, `t15 no deberia traer '${k}': es un banco, no un nivel del guion`);
  // el cfg tiene que estar COMPLETO: es un Object.assign sobre un objeto compartido, asi que una
  // clave ausente no queda en su default — queda pegada de la mision anterior
  for (const k of Object.keys(CAMPAIGN_CFG))
    assert.ok(k in t15.cfg, `al cfg de t15 le falta '${k}' (se pegaria el de la mision anterior)`);
  assert.equal(t15.cfg.fuelOn, true, 'la nafta es media prueba: el plan la pide mostrada siempre');
});

test('epilogo: TODAS las misiones de campaña tienen epi, y por eso el banco puede no tenerlo', () => {
  // `irAlEpilogo()` manda a `advanceCampaign()` a la mision sin `epi`. Eso esta bien para la
  // campaña y seria un desastre para una prueba —termina en la pantalla de VICTORIA—, y por eso
  // el camino sin epilogo esta guardado por `S.test`. Esta red sostiene la otra mitad: que no
  // exista una mision de campaña sin epilogo que caiga en esa misma rama sin querer.
  for (const m of MISSIONS) assert.ok(m.epi, `${m.id} no tiene epilogo`);
});

test('fases: el catalogo de tipos cubre las cinco del plan mas el filo', () => {
  for (const t of ['transito', 'filo', 'descenso', 'rasante', 'blanco', 'vuelta'])
    assert.ok(TIPOS_VALIDOS.includes(t), `falta el tipo ${t}`);
  // los defaults de un tipo solo pueden declarar claves VALIDAS: un default con una clave mal
  // escrita seria invisible — no lo agarra el validador de fases, porque nadie lo escribio en data
  for (const [t, d] of Object.entries(TIPOS))
    for (const k of Object.keys(d))
      assert.ok(CLAVES_F.includes(k), `el tipo ${t} declara una clave desconocida: ${k}`);
  // el transito es el unico que promete CERO enemigos, y es la mitad de la escena
  assert.equal(TIPOS.transito.obstacles, 0);
  assert.equal(TIPOS.transito.caza, 0);
  assert.equal(TIPOS.transito.bombs, 0);
  // el filo estrangula de verdad: su techo tiene que estar MUY por debajo del radar de siempre
  assert.ok(TIPOS.filo.radar < RADAR_ALT_U / 2, 'un filo que no estrangula no es un filo');
});

// ---------- ESTRELLAS DE BUSQUEDA (PLAN_ESTRELLAS_BUSQUEDA §3-§5) ----------
// La matematica es PURA y por eso se prueba aca. Lo que se afirma no son numeros sino las tres
// reglas que hacen que el item no rompa lo que ya existe: el piso SUBE y nunca afloja, la lista
// blanca se UNE y no se reemplaza, y el reloj del escondite es CONTINUO pero perdona el bob.
import { acotar, nivelDe, piso, listaCon, pasoEscondite } from '../src/core/estrellas.js';
import { NIVELES } from '../src/data/estrellas.js';
import { EST_MAX, EST_PERDER_S, EST_GRACIA_S } from '../src/data/tuning.js';

test('estrellas: el contador se acota, y fuera de rango no hay agujeros en la tabla', () => {
  assert.equal(acotar(-3), 0);
  assert.equal(acotar(99), EST_MAX);
  assert.equal(acotar(2.7), 2, 'se trunca: el indice de una tabla no puede ser fraccionario');
  // nunca undefined: un nivel fuera de rango seria un `undefined` silencioso al leerle una clave
  for (const n of [-1, 0, EST_MAX, EST_MAX + 5]) assert.ok(nivelDe(n), `nivel ${n} sin entrada`);
  assert.equal(NIVELES.length, EST_MAX + 1, 'la tabla tiene que cubrir de 0 al tope');
});

test('estrellas: el piso SUBE y nunca afloja lo que la fase ya decidio', () => {
  // …porque este eje decide QUIEN TE BUSCA, no que hay. Una mision que ya bombardea fuerte no se
  // ablanda porque el jugador tenga cero estrellas: eso seria el eje pisando al otro.
  assert.equal(piso('bombs', 1, 0), 1, 'a cero estrellas, lo del cfg manda');
  assert.equal(piso('bombs', 0, 0), 0, 'la ida limpia ES el estado de cero estrellas');
  assert.ok(piso('bombs', 0, 2) > 0, 'con estrellas, la ida deja de estar limpia');
  assert.equal(piso('caza', 2, 1), 2, 'una mision con la cola a fondo no baja por tener una sola');
  // y es monotono: mas estrellas nunca puede significar menos presion
  for (let n = 1; n <= EST_MAX; n++) {
    assert.ok(piso('bombs', 0, n) >= piso('bombs', 0, n - 1), `bombs bajo de ${n-1} a ${n}`);
    assert.ok(piso('caza', 0, n) >= piso('caza', 0, n - 1), `caza bajo de ${n-1} a ${n}`);
  }
});

test('estrellas: la lista blanca se UNE, y por eso un globo no aparece en mar abierto', () => {
  const MAR = ['ola', 'birds'];
  assert.deepEqual(listaCon(MAR, 0), MAR, 'a cero, la lista de la fase intacta');
  const tres = listaCon(MAR, 3);
  assert.ok(MAR.every(t => tres.includes(t)), 'lo que la fase permitia sigue permitido');
  assert.ok(tres.includes('helo') && tres.includes('jet'), 'a ★3 te mandan a buscar');
  // LA REGLA DEL §2: el nivel agrega lo que TE BUSCA, nunca lo que la DISTANCIA pone en el mundo.
  // Si un globo entrara por aca, subir de altura lo haria aparecer en medio del oceano.
  for (let n = 0; n <= EST_MAX; n++)
    assert.ok(!listaCon(MAR, n).includes('balloon'), `★${n} metio un globo: los ejes se mezclaron`);
  // sin lista blanca no hay nada que unir: el sembrador sigue sin recortar
  assert.equal(listaCon(null, 4), null);
  assert.deepEqual(MAR, ['ola', 'birds'], 'y no se muta la lista de la fase');
});

test('estrellas: el escondite es CONTINUO — asomarse de verdad reinicia el reloj', () => {
  const paso = (st, bajo, dt = 1) => pasoEscondite(dt, st, bajo, EST_PERDER_S, EST_GRACIA_S);
  let st = { reloj: 0, fuera: 0 };
  for (let i = 0; i < 5; i++) st = paso(st, true);
  assert.ok(st.reloj >= 5 && !st.baja, 'cinco segundos abajo, todavia no baja');
  // asomarse MAS que la gracia lo borra: esconderse es un compromiso, no algo que se junte de a ratos
  st = paso(st, false, EST_GRACIA_S + 0.5);
  assert.equal(st.reloj, 0, 'asomarse de verdad reinicia');
});

test('estrellas: …pero un bob no te delata (la gracia)', () => {
  // sin esta gracia el oleaje y el cabeceo hacen imposible sostener el rasante limpio, y la
  // mecanica deja de ser una decision para ser una moneda al aire.
  let st = { reloj: 8, fuera: 0 };
  st = pasoEscondite(EST_GRACIA_S * 0.5, st, false, EST_PERDER_S, EST_GRACIA_S);
  assert.equal(st.reloj, 8, 'un toque afuera no borra lo acumulado');
  st = pasoEscondite(0.2, st, true, EST_PERDER_S, EST_GRACIA_S);
  assert.equal(st.fuera, 0, 'y al volver abajo la gracia se repone');
});

test('estrellas: completar el ciclo baja una, y el sobrante no se tira', () => {
  const st = pasoEscondite(2, { reloj: EST_PERDER_S - 0.5, fuera: 0 }, true, EST_PERDER_S, EST_GRACIA_S);
  assert.equal(st.baja, true, 'llegado el tope, baja una estrella');
  near(st.reloj, 1.5);   // el sobrante arranca el ciclo siguiente: no se regala medio segundo
});

// ---------- LAS CHARLAS EN VUELO (SPEC_CHARLAS_VUELO) ----------
// El validador de `core/tramos.js` solo puede comprobar que `charla:` sea TEXTO: core/ no importa
// contenido, asi que desde alla un id inventado pasa. Aca si se ven las dos mitades, y esta es la
// unica red que existe — un id mal escrito en un tramo no da error en el juego: la charla
// simplemente no se arma, y la mision se juega sin la escena sin que nadie se entere.
const { SCENES: SC_VUELO } = await import('../src/data/story.js');
const { CHV_MAX_S } = await import('../src/data/tuning.js');
const { AUTO_MIN, AUTO_CPS } = await import('../src/core/dialogue.js');

/** Cuanto dura una escena 'VUELO' con auto-avance, que es el unico modo que tiene (RF-04). Es la
 *  formula del motor, importada y no copiada: el dia que el tipeo cambie de ritmo, este techo se
 *  mueve con el. */
const duracionCharla = sc => (sc.lineas || []).reduce(
  (t, ln) => t + Math.max(AUTO_MIN, (ln.es || ln.txt || '').length / AUTO_CPS) + (ln.hold || 0), 0);

test('charlas: toda `charla:` de un tramo apunta a una escena VUELO que existe', () => {
  for (const m of MISSIONS) {
    for (const t of m.tramos || []) {
      if (!t.charla) continue;
      const sc = SC_VUELO[t.charla];
      assert.ok(sc, `${m.id}: el tramo pide la charla '${t.charla}' y no existe en story.js`);
      assert.equal(sc.tipo, 'VUELO', `${m.id}: '${t.charla}' no es una escena de tipo VUELO`);
    }
  }
});

test('charlas: ninguna escena VUELO se pasa del tope duro (CHV_MAX_S)', () => {
  // §6.4: "no matar la charla por diseño". Una escena que no entra NO se recorta sola — se parte
  // en dos y se cuelga de dos tramos seguidos. Sin este test eso se descubre volando, y se
  // descubre mal: la charla se corta a mitad de frase y parece un bug del motor.
  const vuelo = Object.values(SC_VUELO).filter(sc => sc.tipo === 'VUELO');
  assert.ok(vuelo.length, 'no hay una sola escena VUELO: el tipo esta declarado y sin usar');
  for (const sc of vuelo) {
    const d = duracionCharla(sc);
    assert.ok(d <= CHV_MAX_S, `${sc.id} dura ${d.toFixed(1)} s y el tope es ${CHV_MAX_S}`);
  }
});

test('charlas: una escena VUELO no lleva placa — el fondo es el juego', () => {
  for (const sc of Object.values(SC_VUELO)) {
    if (sc.tipo !== 'VUELO') continue;
    assert.equal(sc.placa, undefined, `${sc.id} trae placa y el fondo de una charla es el vuelo`);
    assert.ok((sc.lineas || []).length, `${sc.id} no tiene lineas`);
  }
});

// ---------- EL LOADOUT DE REFERENCIA (data/upgrades.js, el selector "real real") ----------
// Con que piruetas se vuela una mision suelta. Se prueba aca y no a ojo porque si la cuenta se
// corre en uno, el selector mide OTRO avion que el de la campaña — y eso no da error: da una
// pirueta que sale (o no) cuando no debia, que es justo lo que las notas de playtest van a acusar.
const { loadoutAt: loadAt, UPGRADES: UPS, ofertaTrasMision: ofertaTras, SIN_ENTREGA } = await import('../src/data/upgrades.js');
const { MISSIONS: MIS } = await import('../src/data/missions.js');
const { SECUENCIAS } = await import('../src/data/story.js');

// ---------- LA RADIO EN VUELO (core/radioVN.js) ----------
const RV = await import('../src/core/radioVN.js');

test('radio: el texto del guion ya dice quien habla', () => {
  // Las claves de tramo vienen como 'CONDOR: ...' — el mismo formato del guion viejo. De ahi
  // salen el nombre y el retrato sin tocar una linea de datos, y eso es lo que hace que agregar
  // una linea de radio sea escribir una linea de texto y nada mas.
  assert.deepEqual(RV.partirHablante('CONDOR: ANOTO POSICIONES.'),
    { personaje: 'CONDOR', txt: 'ANOTO POSICIONES.' });
  assert.deepEqual(RV.partirHablante('EL TURCO: DE LA RONDA NO SE VA NADIE.'),
    { personaje: 'EL TURCO', txt: 'DE LA RONDA NO SE VA NADIE.' });
  // sin prefijo es una acotacion: caja sin nombre y sin busto
  assert.equal(RV.partirHablante('...').personaje, null);
});

test('radio: una linea larga dura mas que una corta, y ninguna es eterna', () => {
  // El jugador esta VOLANDO. Si la linea se va antes de poder leerla no cuenta nada, y si se
  // queda para siempre tapa el horizonte. Las dos puntas estan acotadas a proposito.
  RV.decir('PUMA: COPIADO.', () => null);
  const corta = RV.radio.dur;
  RV.decir('CONDOR: SETENTA METROS. TIRA LA RED, LA LEVANTA, LA VUELVE A TIRAR. Y MIENTRAS TANTO ANOTA TODO LO QUE LE PASA AL LADO.', () => null);
  const larga = RV.radio.dur;
  assert.ok(larga > corta, 'la linea larga tiene que durar mas');
  assert.ok(corta >= 2.5, 'ninguna linea puede irse antes de poder leerla');
  assert.ok(larga <= 9, 'ninguna linea puede quedarse para siempre');
});

test('radio: se va sola, y la barrita cuenta el tiempo que le queda', () => {
  // NO SE AVANZA APRETANDO: pedirle un boton a alguien que esta a treinta metros del agua es
  // pedirle que elija entre leer y volar. La barrita es la unica forma honesta de avisar.
  RV.decir('CONDOR: PLATA FIEL, POSICIONES.', () => null);
  assert.equal(RV.restante(), 1, 'recien dicha, la barra esta llena');
  RV.tickRadio(RV.radio.dur / 2);
  assert.ok(Math.abs(RV.restante() - 0.5) < 0.05, 'a mitad de camino, media barra');
  RV.tickRadio(RV.radio.dur);
  assert.equal(RV.radio.activa, false, 'se apaga sola sin que nadie apriete nada');
  assert.equal(RV.restante(), 0);
});

test('radio: callar() MUTA el store, no lo reemplaza', () => {
  // La invariante de state.js §1: quien tenga una referencia al array de renglones tiene que
  // seguir viendo el mismo objeto. Reasignarlo no rompe nada visible y por eso es peligroso.
  RV.decir('GITANO: ¿UN PESQUERO?', () => null);
  const wrapAntes = RV.radio.wrap;
  RV.callar();
  assert.equal(RV.radio.wrap, wrapAntes, 'el array de renglones es el mismo objeto');
  assert.equal(RV.radio.wrap.length, 0, 'pero quedo vacio');
  assert.equal(RV.visible(), false);
});

test('campaña: la tarjeta de nivel dice el numero de mision que le toca', () => {
  // EL NUMERO ESTA ESCRITO DOS VECES: la posicion en MISSIONS, y el campo `capitulo` de la
  // tarjeta. Un dato escrito dos veces se desincroniza, y este ya lo hizo: al pasar de 12 a 14
  // misiones las tarjetas siguieron diciendo el numero viejo, y en pantalla no se ve raro — se ve
  // como una mision que se llama distinto de lo que el menu dijo.
  //
  // El titulo YA NO lleva el numero en el texto (pedido de Matias, 30/8): la pantalla lo pinta
  // aparte, chico, arriba del nombre ("CAPÍTULO n"). Por eso el chequeo pasa a mirar `capitulo`.
  //
  // El ID de la escena NO se revisa a proposito: es inmutable (SISTEMA_DIALOGO D1) y su numero
  // es historia, no posicion. Lo que tiene que estar al dia es `capitulo`.
  MIS.forEach((mi, i) => {
    const ids = SECUENCIAS[mi.story] || [];
    const tarjeta = ids.map(id => SCENES[id]).find(sc => sc && sc.tipo === 'TARJETA');
    if (!tarjeta) return;                      // no toda mision tiene tarjeta, y esta bien
    assert.ok(tarjeta.capitulo != null, `${mi.id}: la tarjeta tiene que traer "capitulo"`);
    assert.equal(tarjeta.capitulo, i + 1, `${mi.id} es la mision ${i + 1} pero su tarjeta dice capitulo ${tarjeta.capitulo}`);
  });
});

test('libreta: la primera mision se vuela SIN mejoras', () => {
  // El tutorial es el avion de fabrica: el guion no le regalo nada todavia.
  assert.deepEqual(loadAt(0), []);
});

test('libreta: LA RAMPA DE ENTRADA — el tutorial no entrega, la segunda sirve una sin elegir', () => {
  // Pedido de Matias (23/8). La primera decision del juego —cual de dos piruetas aprender— caia
  // justo despues del TUTORIAL, cuando el jugador todavia no sabe que es una pirueta. Ahora la
  // campaña enseña el mecanismo antes de pedir que se use.
  assert.equal(ofertaTras(0), 0, 'el epilogo del tutorial no puede abrir el banco');
  assert.equal(ofertaTras(1), 1, 'la segunda entrega UNA, servida: no hay nada que elegir');
  // Y con el guion 3.0 hay una SEGUNDA ventana cerrada: m10 LOS PRIMOS, la primera mision
  // despues de la muerte del Pichon. Que el banco no se abra esa noche dice algo — el que
  // inventaba las mejoras no esta. Se prueba que sea EXACTAMENTE esa y no otra.
  assert.equal(ofertaTras(SIN_ENTREGA), 0, 'la noche sin el Pichon no abre el banco');
  for (let i = 2; i <= MIS.length; i++) {
    if (i === SIN_ENTREGA) continue;
    assert.equal(ofertaTras(i), 2, `m${i + 1} tiene que ofrecer dos`);
  }
});

test('libreta: se gana UNA por ventana, en el orden causal del guion', () => {
  assert.deepEqual(loadAt(1), [], 'entrando a m2 todavia no hay nada: el tutorial no entrego');
  assert.deepEqual(loadAt(2), [UPS[0].id], 'entrando a m3, la que sirvio m2');
  assert.deepEqual(loadAt(4), [UPS[0].id, UPS[1].id, UPS[2].id]);
  // la cuenta se DERIVA de la misma regla que usa la campaña, no de una tabla aparte
  for (let i = 0; i <= MIS.length; i++) {
    let n = 0;
    for (let j = 0; j < i; j++) if (ofertaTras(j) > 0) n++;
    assert.equal(loadAt(i).length, Math.min(n, UPS.length), `loadout de i=${i}`);
  }
});

test('libreta: con 14 misiones se aprenden TODAS, y el banco no se queda sin cartas', () => {
  // LA CUENTA CAMBIO TRES VECES Y ESTA PRUEBA ES LA QUE SE ENTERA. Con 12 misiones sobraban dos
  // mejoras sin aprender. Con las 14 del guion 3.0 la misma regla daria 13 ventanas para 12
  // cartas: el banco se quedaria VACIO antes del final y las ultimas misiones no entregarian
  // nada — en silencio, porque `nextUpgrades` devuelve lista vacia y la pantalla no se abre.
  // La segunda ventana cerrada (m10) es lo que cuadra la cuenta, y lo hace por una razon de
  // guion, no numerica. Lo que se prueba aca es que ventanas y cartas EMPATEN.
  let ventanas = 0;
  for (let i = 0; i < MIS.length; i++) if (ofertaTras(i) > 0) ventanas++;
  assert.equal(ventanas, UPS.length, 'una ventana por mejora: ni sobran cartas ni sobran noches');
  assert.equal(loadAt(MIS.length).length, UPS.length, 'terminada la campaña estan las doce');
  // y ninguna ventana puede quedar sin cartas para ofrecer
  for (let i = 0; i < MIS.length; i++) {
    const o = ofertaTras(i);
    if (o > 0) assert.ok(loadAt(i).length < UPS.length, `la ventana de i=${i} tiene algo que ofrecer`);
  }
});

test('libreta: nunca desborda ni devuelve basura', () => {
  assert.deepEqual(loadAt(-5), []);
  assert.equal(loadAt(999).length, UPS.length);
  for (const id of loadAt(999)) assert.ok(UPS.some(u => u.id === id), `id desconocido: ${id}`);
});

test('libreta: es un ARRAY NUEVO cada vez (nadie puede ensuciar el catalogo)', () => {
  // `pichon` se muta al elegir en el banco: si loadoutAt devolviera una vista del catalogo, una
  // partida le agregaria mejoras a UPGRADES y la siguiente arrancaria con ellas.
  const a = loadAt(4); a.push('intruso');
  assert.equal(loadAt(4).length, 3);
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
  const tPir = CINE_VUELO.RAS_T + CINE_VUELO.POSE_T + 0.7;   // rasante + salto + un BREAK TURN
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

// ---------------- LO TRANSONICO: la vara del vapor y el cono (core/mach.js) ----------------
// Es la unica cuenta del efecto, y si se corre el efecto deja de significar lo que dice: el cono
// tiene que ser la recompensa de SOSTENER el turbo, no algo que aparece volando de crucero.
import { machNow, vaporAmt, conoAmt, cruzo } from '../src/core/mach.js';
import { M_VAPOR, M_CONO, M_CONO_FULL, A_MAR, KMH_U } from '../src/data/tuning.js';
import { AFTER_MAX, AFTER_CAP } from '../src/core/physics.js';

test('mach: el numero es el del HUD dividido la velocidad del sonido en el mar', () => {
  near(machNow(A_MAR / KMH_U), 1, 1e-9);            // por definicion
  near(machNow(0), 0);
  // el techo REAL del juego (physics.js): con todos los escalones de afterburner
  const techo = machNow(280 + AFTER_MAX * AFTER_CAP);
  assert.ok(techo > 1.6 && techo < 1.8, `el techo del juego da M ${techo.toFixed(2)}`);
});

test('mach: el cono pide TURBO y el vapor no', () => {
  // crucero con racha y sin turbo ronda las 240 unidades (base 150 x racha 1.6)
  assert.equal(conoAmt(240), 0, 'volando de crucero no puede haber cono');
  assert.ok(vaporAmt(240, 1) > 0, 'pero virando fuerte SI tiene que haber vapor de ala');
  // turbo sostenido sin escalones: 280
  assert.ok(conoAmt(280) > 0, 'con turbo sostenido tiene que empezar a haber cono');
  assert.equal(conoAmt(A_MAR * M_CONO_FULL / KMH_U), 1, 'y llenarse en M_CONO_FULL');
});

test('mach: el vapor sale de la CARGA, no de la velocidad sola', () => {
  const rapido = 300;
  assert.equal(vaporAmt(rapido, 0), 0, 'derecho y sin G no hay vapor por rapido que vayas');
  assert.ok(vaporAmt(rapido, 0.5) < vaporAmt(rapido, 1), 'mas G, mas vapor');
  assert.equal(vaporAmt(A_MAR * (M_VAPOR - 0.01) / KMH_U, 1), 0, 'por debajo del umbral, nada');
});

test('mach: el CRUCE es un evento, no un nivel', () => {
  const bajo = A_MAR * (M_CONO - 0.02) / KMH_U, alto = A_MAR * (M_CONO + 0.02) / KMH_U;
  assert.ok(cruzo(bajo, alto), 'de abajo hacia arriba, cruza');
  assert.ok(!cruzo(alto, alto), 'quedarse adentro NO es cruzar (si no, dispara cada cuadro)');
  assert.ok(!cruzo(alto, bajo), 'salir tampoco');
});

// ================= EL HORNO (PLAN_HORNEADO B0) =================
// Las cajas de las hojas de sprites ya no se cuentan a ojo: las mide el horneador escaneando el
// alfa y las escribe en DOS lugares — el JSON al lado de las hojas y el modulo ES que importa
// render/enemies.js. Salen de la misma medicion, asi que no pueden divergir... salvo que alguien
// edite uno de los dos a mano, que es exactamente lo que estas tres pruebas no dejan pasar.
test('horno: el JSON de cajas y el modulo generado dicen lo mismo', async () => {
  const { CAJAS } = await import('../src/data/cajas.js');
  const json = JSON.parse(readFileSync(new URL('../assets/world/enemies/cajas.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(CAJAS).sort(), Object.keys(json).sort(),
    'alguien agrego o saco una hoja en uno solo de los dos');
  for (const k in json) {
    assert.deepEqual(CAJAS[k].box, json[k].box, `la caja de '${k}' difiere entre el JSON y el modulo`);
    assert.equal(CAJAS[k].fw, json[k].fw, `el fw de '${k}' difiere`);
    assert.equal(CAJAS[k].cols, json[k].cols, `las columnas de '${k}' difieren`);
  }
});

test('horno: toda hoja horneada tiene su perilla de tamaño y su archivo', async () => {
  const { CAJAS } = await import('../src/data/cajas.js');
  const src = readFileSync(new URL('../src/render/enemies.js', import.meta.url), 'utf8');
  for (const k in CAJAS) {
    // `wu` no se puede medir (dice que tan grande se VE el bicho, no que tan grande es el dibujo)
    // y por eso queda a mano en ARTE. Una hoja nueva sin su wu se dibujaria del tamaño de un pixel.
    // sin anclar a principio de linea: las hojas de una misma familia se declaran de a varias por
    // renglon cuando son perillas de un solo campo (los nueve buques de B2)
    assert.ok(new RegExp(`\\b${k}: \\{[^}]*wu:`).test(src), `la hoja '${k}' no tiene wu en ARTE`);
    assert.ok(src.includes(`${k}: '../assets/world/enemies/${k}.png'`), `la hoja '${k}' no tiene archivo en FILES`);
  }
});

test('horno: el contenido entra en la celda con aire (regla 5 del plan)', async () => {
  const { CAJAS } = await import('../src/data/cajas.js');
  // 2 px de margen es la leccion de explosions_front, que se cortaba sola al escalar. Se mide
  // sobre la UNION de las poses: si el helo se sale de la celda al girar el rotor, salta aca.
  for (const k in CAJAS) {
    const c = CAJAS[k];
    assert.ok(c.box.x1 < c.fw && c.box.y1 < c.fh, `'${k}' se sale de su propia celda`);
    assert.ok(c.margen >= 2, `'${k}' queda a ${c.margen} px del borde y el plan pide 2`);
  }
});

// ================= LOS RESTOS (PLAN_HORNEADO B1) =================
test('restos: toda receta que promete carcasa tiene la hoja horneada', async () => {
  const { CAJAS } = await import('../src/data/cajas.js');
  const { DESPIECE } = await import('../src/data/despiece.js');
  const conResto = Object.keys(DESPIECE).filter(t => DESPIECE[t].resto);
  assert.ok(conResto.length >= 10, `solo ${conResto.length} tipos declaran resto`);
  for (const t of conResto) {
    // Sin la hoja, `morir()` planta un obstaculo que `drawObstacle` no dibuja: una muerte que
    // promete carcasa y no la deja. No hay error en runtime que lo delate — salta aca o no salta.
    assert.ok(CAJAS[DESPIECE[t].resto], `'${t}' promete '${DESPIECE[t].resto}' y esa hoja no existe`);
  }
});

test('restos: cada tipo deja el SUYO, ninguno comparte carcasa', async () => {
  const { DESPIECE } = await import('../src/data/despiece.js');
  // Es la misma regla que D2 le puso a las muertes: si el camion volcado y el deposito quemado son
  // el mismo sprite, el pasillo no cuenta nada. Una carcasa generica seria mas facil de hacer y
  // seria exactamente el error que el plan prohibe.
  const hojas = Object.keys(DESPIECE).map(t => DESPIECE[t].resto).filter(Boolean);
  assert.equal(new Set(hojas).size, hojas.length, 'hay dos tipos compartiendo carcasa');
});

test('restos: lo que se desintegra NO deja carcasa (la ausencia dice algo)', async () => {
  const { DESPIECE } = await import('../src/data/despiece.js');
  // Un avion que revienta a 200 m no deja un fuselaje prolijo en el suelo, deja pedazos. Que
  // `plane` no tenga resto es una decision, no un olvido — igual que la carpa que no tiene bola
  // de fuego. Si algun dia todos tuvieran carcasa, la carcasa dejaria de significar.
  assert.ok(!DESPIECE.plane.resto, 'el avion del jugador no puede dejar carcasa: se desintegra');
  const sin = Object.keys(DESPIECE).filter(t => !DESPIECE[t].resto);
  assert.ok(sin.length >= 3, `solo ${sin.length} tipos sin carcasa: la ausencia dejo de ser una eleccion`);
});

// ================= LOS BUQUES (PLAN_HORNEADO B2) =================
test('buques: cada clase del juego tiene sus tres vistas horneadas', async () => {
  const { CAJAS } = await import('../src/data/cajas.js');
  const { SHIP_CLASS } = await import('../src/data/ships.js');
  const clases = [...new Set(Object.values(SHIP_CLASS))];
  assert.deepEqual(clases.sort(), ['cv', 'log', 't21', 't42'], 'aparecio una clase de buque nueva');
  for (const c of clases) {
    // Si falta una, el buque de esa clase cae al casco generico y se vuelve indistinguible de los
    // otros dos — que es exactamente el problema que B2 vino a arreglar, y en silencio.
    for (const v of ['buque_', 'proa_', 'hundido_']) {
      assert.ok(CAJAS[v + c], `falta la hoja '${v + c}'`);
    }
  }
});

test('buques: todos los buques del juego tienen clase declarada', async () => {
  const { SHIPS } = await import('../src/data/missions.js');
  const { SHIP_CLASS } = await import('../src/data/ships.js');
  // Un buque sin clase navega de destructor (`|| 't42'` en render/world.js) y eso es un respaldo,
  // no un plan: el SIR TRISTRAM dibujado como Tipo 42 seria un buque de carga con radomos.
  for (const n of SHIPS) assert.ok(SHIP_CLASS[n], `'${n}' no declara clase en SHIP_CLASS`);
});

test('buques: la hoja de costado NO se hornea bajo la flotacion', async () => {
  const { CAJAS } = await import('../src/data/cajas.js');
  // El horno recorta en y=0 (`clipY`), asi que el borde de abajo del contenido ES la linea de
  // agua — y de ahi sale el anclaje. Si alguien sacara el recorte, la obra viva entraria en la
  // hoja y el buque se dibujaria FLOTANDO por encima del mar, sin ningun error que lo delate.
  // La firma de que el recorte esta puesto: el contenido llega cerca del borde de abajo pero no
  // lo toca (2 px de margen), y la caja de las tres clases termina en la misma fila.
  const filas = ['t42', 't21', 'log'].map(c => CAJAS['buque_' + c].box.y1);
  assert.equal(new Set(filas).size, 1,
    `las tres clases no comparten linea de flotacion: ${filas.join(' ')}`);
});

// ================= EL HARRIER (PLAN_HORNEADO B3) =================
test('harrier: las tres poses de LA COLA existen y son suyas', async () => {
  const { CAJAS } = await import('../src/data/cajas.js');
  for (const k of ['harrier', 'harrier_rear', 'harrier_turn']) {
    assert.ok(CAJAS[k], `falta la hoja '${k}'`);
    assert.equal(CAJAS[k].cols, 5, `'${k}' tiene que tener 5 columnas`);
  }
  // Y EL JET GENERICO SIGUE SIENDO SUYO: son dos aviones distintos que pueden estar en el mismo
  // cuadro. Si algun dia vuelven a ser el mismo modelo, esto no lo agarra — pero que las hojas
  // esten separadas es la condicion previa.
  assert.ok(CAJAS.jet, 'el caza generico del pasillo no puede desaparecer');
  assert.ok(!CAJAS.jet_rear && !CAJAS.jet_turn,
    'jet_rear/jet_turn quedaron sin consumidor al llegar el Harrier: no deben re-hornearse');
});

test('harrier: la hoja del viraje SE DIBUJA (no se hornea al vacio)', () => {
  // ESTA PRUEBA EXISTE POR UN CASO REAL. `jet_turn` se horneaba en cada pasada del horno y NINGUN
  // archivo de src/ la nombraba: pasaron meses con una hoja muerta —y ademas mal horneada, con el
  // avion encabritado— sin que nada avisara. El doc del plan afirmaba que el render la usaba.
  // La regla que sale de ahi: una hoja que se hornea tiene que tener consumidor en el juego.
  const caza = readFileSync(new URL('../src/render/caza.js', import.meta.url), 'utf8');
  assert.ok(caza.includes("'harrier_turn'"), 'nadie dibuja harrier_turn: volvio a ser arte muerto');
  assert.ok(caza.includes("H.fase === 'recola'"), 'el viraje ya no se ata a la recola');
});

test('horno: toda hoja horneada tiene consumidor en el juego', async () => {
  const { CAJAS } = await import('../src/data/cajas.js');
  // La generalizacion de la prueba de arriba. `FILES` de render/enemies.js es la lista de lo que
  // el juego SABE cargar; una hoja horneada que no este ahi es arte que nadie va a ver nunca.
  const src = readFileSync(new URL('../src/render/enemies.js', import.meta.url), 'utf8');
  for (const k in CAJAS) {
    assert.ok(src.includes(`${k}: '../assets/world/enemies/${k}.png'`),
      `la hoja '${k}' se hornea y el juego no la carga: arte muerto`);
  }
});

// ================= LAS PARTES v2 (PLAN_HORNEADO B5) =================
test('partes: el orden de la hoja y el del modelo son el mismo', async () => {
  const { PARTES_HOJA } = await import('../src/data/despiece.js');
  // ESTA PRUEBA REEMPLAZA A UN "OJO" EN LA CONSOLA. El runner del horneado imprime el orden de las
  // filas al terminar, con la nota "tiene que coincidir con PARTES" — o sea que la única custodia
  // era que alguien mirara esa salida y se acordara. Si una pieza se mete en el MEDIO, todo el
  // escombro pasa a ser otra cosa: el ala del avion se dibuja como una deriva, el rotor como un
  // tanque, y no hay error en runtime que lo delate.
  const src = readFileSync(new URL('../tools/models/partes.js', import.meta.url), 'utf8');
  const cuerpo = src.slice(src.indexOf('const PIEZAS = {'));
  const enModelo = [...cuerpo.matchAll(/^ {4}([a-zA-Z]+)\(g[,)]/gm)].map(m => m[1]);
  assert.deepEqual(enModelo, PARTES_HOJA,
    'el orden de tools/models/partes.js dejo de coincidir con PARTES_HOJA de data/despiece.js');
});

test('partes: toda firma que una receta promete tiene modelo', async () => {
  const { DESPIECE, PARTES_HOJA, piezaHorneada } = await import('../src/data/despiece.js');
  // `pieza` es LA parte de un tipo — la que sale entera y girando. Una que no esté en la hoja no
  // rompe nada (cae al bulto a mano) pero pierde justo lo que la hacía la firma. Hasta B5 NINGUNA
  // estaba horneada; que esto pase es la medida de la etapa.
  const firmas = [...new Set(Object.keys(DESPIECE).map(t => DESPIECE[t].pieza).filter(Boolean))];
  assert.ok(firmas.length >= 8, `solo ${firmas.length} tipos declaran firma`);
  for (const f of firmas) assert.ok(piezaHorneada(f), `la firma '${f}' no tiene modelo horneado`);
  // y toda pieza de `partes` tambien: son las que se reparten por indice
  for (const t in DESPIECE) {
    for (const p of DESPIECE[t].partes || []) {
      if (p) assert.ok(PARTES_HOJA.includes(p), `'${t}' pide la pieza '${p}', que no existe`);
    }
  }
});

test('partes: dos tipos no comparten firma', async () => {
  const { DESPIECE } = await import('../src/data/despiece.js');
  // Es la regla de D2 llevada a las piezas: si el camion AA y el nido AA largan lo mismo, la firma
  // deja de firmar. Pasó — los dos decían `cabina` y `canon` respectivamente por accidente, y el
  // deposito declaraba `tanque`, que es una pieza de AVION.
  const firmas = Object.keys(DESPIECE).map(t => DESPIECE[t].pieza).filter(Boolean);
  assert.equal(new Set(firmas).size, firmas.length,
    'hay dos tipos con la misma firma: ' + firmas.join(' '));
});

// ---------------------------------------------------------------------------------------------
// EL CONTRATO DE LOS CUATRO GANCHOS DE MOTOR (docs/historia/PLAN_4_PENDIENTES.md, fase 0).
//
// POR QUE ESTOS TESTS EXISTEN. Los cuatro pendientes de motor se escriben en paralelo, en archivos
// distintos, y recien despues se cuelgan de game.js. Lo unico compartido entre las cuatro vias son
// estas firmas. Si una via las cambia sobre la marcha, las otras tres se enteran cuando ya no se
// puede: en el merge. Esto lo convierte en un fallo de test, que es donde tiene que doler.
//
// NO prueban comportamiento — todavia no hay comportamiento que probar. Prueban que la costura
// existe y tiene la forma acordada.
// ---------------------------------------------------------------------------------------------

test('ganchos: desgaste acumula, escala 0..1 y se resetea MUTANDO', async () => {
  const m = await import('../src/core/desgaste.js');
  const ref = m.desgaste;                       // identidad estable: el store se comparte
  assert.equal(m.nivel(), 0, 'celula nueva arranca en 0');
  m.tickDesgaste(5); m.misionCumplida();
  assert.ok(m.nivel() > 0 && m.nivel() < 1, 'el nivel vive en 0..1');
  m.tickDesgaste(1000);
  assert.equal(m.nivel(), 1, 'satura en 1, no se pasa');
  m.resetDesgaste();
  assert.equal(m.nivel(), 0);
  assert.equal(m.desgaste, ref, 'resetDesgaste REASIGNO el store en vez de mutarlo');
});

test('saves: la cicatriz viaja con la partida, y las DOS mitades siguen ahi (G-04)', async () => {
  // POR QUE ESTE TEST EXISTE. Si el desgaste no se guarda, el avion SE CURA SOLO al cargar una
  // partida — y no rompe nada: no hay error, no hay warning, simplemente la campaña vuelve a
  // empezar con la chapa sana. Es de los fallos que no se descubren jugando porque no se ven; se
  // descubren meses despues, cuando ya nadie se acuerda de que el avion tenia que acumular.
  //
  // Y SON DOS MITADES EN PUNTAS OPUESTAS DEL ARCHIVO: `doSave` mete la cicatriz en el payload y
  // `loadSave` la vuelve a poner en el store. Cualquiera de las dos se puede tocar sin la otra
  // —son 400 lineas de distancia— y el sintoma de que una se fue es el mismo silencio. Por eso se
  // revisan LAS DOS, y contra el game.js que corre, no contra una copia de lo que decia.

  // 1. EL ALMACEN: un registro con `desg` sobrevive el viaje de ida y vuelta por localStorage.
  const mem = new Map();
  globalThis.localStorage = {
    getItem: k => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, String(v)),
  };
  const saves = await import('../src/systems/saves.js');
  const rec = saves.saveGame({ camp: 0, level: 3, score: 120, lives: 2, ups: [], desg: { i: 7, m: 2 } });
  const leido = saves.listSaves().find(r => r.id === rec.id);
  assert.deepEqual(leido.desg, { i: 7, m: 2 }, 'la cicatriz no sobrevivio el guardado');
  const tras = saves.overwriteSave(rec.id, { camp: 0, level: 4, score: 200, lives: 1, ups: [], desg: { i: 9, m: 3 } });
  assert.deepEqual(tras.desg, { i: 9, m: 3 }, 'sobrescribir un slot perdio la cicatriz');
  delete globalThis.localStorage;

  // 2. LAS DOS MITADES, en el game.js que corre.
  const src = readFileSync(new URL('../src/game.js', import.meta.url), 'utf8');
  const cuerpo = (nombre) => {
    const i = src.indexOf('function ' + nombre + '(');
    assert.ok(i > 0, `no existe ${nombre}() — si se renombro, hay que actualizar este test`);
    return src.slice(i, i + 1200);
  };
  const guarda = cuerpo('doSave');
  assert.ok(/desg\s*:/.test(guarda), 'doSave() dejo de meter `desg` en el payload: el avion se cura al cargar');
  assert.ok(/desgaste\.impactos/.test(guarda) && /desgaste\.misiones/.test(guarda),
    'doSave() guarda un `desg` que ya no sale del store de desgaste');
  const carga = cuerpo('loadSave');
  assert.ok(/rec\.desg/.test(carga), 'loadSave() dejo de leer `desg`: lo guardado no vuelve al avion');
  assert.ok(/desgaste\.impactos\s*=/.test(carga) && /desgaste\.misiones\s*=/.test(carga),
    'loadSave() lee `desg` pero ya no lo escribe en el store');
  assert.ok(/resetDesgaste\(\)/.test(carga),
    'loadSave() tiene que RESETEAR antes de aplicar: una partida vieja sin `desg` heredaria la chapa de la anterior');
});

test('ganchos: los barks respetan la curva del tono', async () => {
  const { BARKS, barkDe, barksVivos } = await import('../src/data/barks.js');
  assert.ok(BARKS.length >= 1, 'tiene que existir al menos HEAVY MACHINE GUN');
  for (const b of BARKS) {
    assert.ok(b.id && b.texto && b.cuando, `bark incompleto: ${JSON.stringify(b)}`);
    // §9c: el banco se achica en M9-M13 y en M14 NO HAY NI UNO. Es la regla que hace que el
    // jugador sienta que el juego se quedo callado sin poder nombrarlo.
    assert.ok(b.hasta <= 13, `el bark '${b.id}' puede sonar en M14, y en M14 no suena ninguno`);
  }
  assert.equal(barkDe('__no_existe__'), null);
  assert.equal(barksVivos(14, new Set()).length, 0, 'M14 tiene que quedar muda');
  const usados = new Set(BARKS.map(b => b.id));
  assert.equal(barksVivos(1, usados).length, 0, 'un bark usado no vuelve a sonar en la campaña');
});

test('ganchos: interstitial() y drawBark() existen con la firma acordada', () => {
  // LOS MODULOS DE RENDER NO SE PUEDEN IMPORTAR ACA: `render/ctx.js` toca `document` al cargar, y
  // en node no hay canvas. Se leen como texto, que es lo que ya hace el resto de los tests que
  // miran fuentes. Alcanza: lo que se esta fijando es la FIRMA, no el dibujo.
  const scr = readFileSync(new URL('../src/render/screens.js', import.meta.url), 'utf8');
  const brk = readFileSync(new URL('../src/render/bark.js', import.meta.url), 'utf8');
  assert.match(scr, /export function interstitial\(txt, p, t\)/,
    'falta interstitial(txt, p, t) en render/screens.js');
  assert.match(brk, /export function drawBark\(txt, p\)/,
    'falta drawBark(txt, p) en render/bark.js');
  assert.match(brk, /export const BARK_S = [\d.]+/,
    'BARK_S es cuanto dura el cartel en pantalla');
});

// ---------------------------------------------------------------------------------------------
// EL PASILLO EN ZIGZAG (docs/sistemas/PLAN_PASILLO_ZIGZAG.md, fase Z0)
// ---------------------------------------------------------------------------------------------

test('zigzag: APAGADO devuelve CERO EXACTO — la garantia de que nada cambia', async () => {
  const z = await import('../src/core/zigzag.js');
  z.reset();
  // Object.is y no ==: -0 tambien seria "igual a 0" con ==, y lo que se esta afirmando es que
  // el termino sumado es el cero que deja `x + 0 === x` bit a bit. Esta es LA prueba del item:
  // si esto vale, un mapa sin zigzag se dibuja igual que antes de que el modulo existiera.
  for (const zz of [0, 0.5, 1, 14, 100, 320, 400, 999, -5, NaN]) {
    assert.ok(Object.is(z.bendW(zz), 0), `bendW(${zz}) tiene que ser 0 exacto y es ${z.bendW(zz)}`);
  }
  for (const spd of [0, 62, 74, 150, 300]) {
    assert.ok(Object.is(z.deriva(spd), 0), `deriva(${spd}) tiene que ser 0 exacto`);
  }
  assert.equal(z.zz.on, false);
  assert.equal(z.zz.curv, 0);
});

test('zigzag: apagar() deja el store en cero, no solo el interruptor', async () => {
  const z = await import('../src/core/zigzag.js');
  z.reset();
  z.rebuild(500, { amp: 1, largo: 600, seed: 5 }, 0);
  assert.notEqual(z.zz.curv, 0, 'la curva tiene que estar doblando para que la prueba valga');
  z.apagar();
  // sin esto, la curvatura vieja quedaria empujando la deriva despues de entrar al climax
  assert.ok(Object.is(z.zz.curv, 0), 'apagar() tiene que borrar la curvatura');
  assert.ok(Object.is(z.deriva(150), 0));
  assert.ok(Object.is(z.bendW(320), 0));
});

test('zigzag: la recta no dobla y la curva dobla lo que dice la geometria', async () => {
  const z = await import('../src/core/zigzag.js');
  const { ZZ_CURV_MAX } = await import('../src/data/tuning.js');
  const trazado = [[400, 0], [800, 1], [400, 0]];
  z.reset();
  // EN LA RECTA: cero, aunque el zigzag este PRENDIDO. Es lo que hace que el transito del
  // Narwal (m5, primer tercio) siga siendo el tramo recto de siempre con el callejon declarado.
  z.rebuild(0, { trazado }, 0);
  assert.ok(Math.abs(z.bendW(320)) < 0.001, `en la recta bendW debe ser ~0 y es ${z.bendW(320)}`);
  // ADENTRO DE LA CURVA: bend(z) = curv * z^2 / 2. Con curvatura plena y z=320 son 85,3 m.
  // Se compara contra la GEOMETRIA y no contra un numero grabado: si alguien cambia el paso de
  // integracion o ZZ_CURV_MAX, este test sigue diciendo la verdad.
  z.rebuild(400 + 800 / 2, { trazado }, 0);
  const teorico = ZZ_CURV_MAX * 320 * 320 / 2;
  assert.ok(Math.abs(z.bendW(320) - teorico) / teorico < 0.05,
    `bendW(320) deberia ser ~${teorico.toFixed(1)} m y es ${z.bendW(320).toFixed(1)}`);
});

test('zigzag: el trazado es DETERMINISTA — la misma mision dobla siempre igual', async () => {
  const z = await import('../src/core/zigzag.js');
  const spec = { amp: 0.8, largo: 550, seed: 7 };
  const leer = () => { z.rebuild(1234, spec, 0); return z.bendW(300); };
  const a = leer(), b = leer();
  assert.equal(a, b, 'dos reconstrucciones iguales tienen que dar el mismo trazado');
  // y otra semilla tiene que dar OTRO camino: si no, la semilla no sirve para nada
  z.rebuild(1234, { amp: 0.8, largo: 550, seed: 8 }, 0);
  assert.notEqual(z.bendW(300), a, 'cambiar la semilla tiene que cambiar el trazado');
});

test('zigzag: la curvatura no salta — el empalme la hace continua', async () => {
  const z = await import('../src/core/zigzag.js');
  const { ZZ_EMPALME, ZZ_CURV_MAX } = await import('../src/data/tuning.js');
  // un salto de recta a curva plena: sin empalme el horizonte daria un tiron
  const spec = { trazado: [[400, 0], [800, 1]] };
  let maxSalto = 0, prev = z.curvAt(0, spec, 0);
  for (let d = 1; d < 1200; d++) {
    const c = z.curvAt(d, spec, 0);
    maxSalto = Math.max(maxSalto, Math.abs(c - prev));
    prev = c;
  }
  // el techo teorico de una rampa suave de ZZ_EMPALME metros es 1.5*ZZ_CURV_MAX/ZZ_EMPALME
  const techo = 1.5 * ZZ_CURV_MAX / ZZ_EMPALME;
  assert.ok(maxSalto <= techo * 1.05,
    `la curvatura salta ${maxSalto.toExponential(2)} por metro, techo ${techo.toExponential(2)}`);
});

test('zigzag: la ventana desde/hasta se resuelve por FRACCION y sobrevive a ?qa', async () => {
  const z = await import('../src/core/zigzag.js');
  const spec = { amp: 1, largo: 600, seed: 1, desde: 0.35, hasta: 0.9 };
  // la MISMA fraccion en dos misiones de largo muy distinto tiene que dar la misma ventana:
  // es lo que hace que `?qa` (que comprime al 6%) no rompa el guion del trazado.
  for (const obj of [2600, 156]) {
    assert.ok(z.ventana(obj * 0.1, spec, obj) === 0, 'antes de `desde` la ventana esta cerrada');
    assert.ok(z.ventana(obj * 0.62, spec, obj) > 0.99, 'en el medio esta abierta');
    assert.ok(z.ventana(obj * 0.99, spec, obj) < 0.5, 'sobre `hasta` se esta cerrando');
  }
  // SIN OBJETIVO (POR LA PATRIA, infinito) la ventana es entera: no hay fraccion de algo que
  // no termina, y el modo tiene que poder usar el zigzag igual.
  assert.equal(z.ventana(50000, spec, 0), 1);
});

test('zigzag: la deriva tira hacia AFUERA y esta topada', async () => {
  const z = await import('../src/core/zigzag.js');
  const { ZZ_DERIVA_MAX } = await import('../src/data/tuning.js');
  z.reset();
  z.rebuild(0, { trazado: [[400, 1]] }, 0);   // curva a la DERECHA, plena desde el metro 0
  z.rebuild(300, { trazado: [[400, 1]] }, 0);
  assert.ok(z.zz.curv > 0, 'la curva tiene que estar doblando a la derecha');
  assert.ok(z.deriva(74) < 0, 'doblando a la derecha, la centrifuga tira a la IZQUIERDA');
  // el tope existe para que entrar con turbo sea un RIESGO y no una muerte sin salida:
  // 37,5 m/s crudos contra 30 de palanca no se sostienen ni yendo a fondo.
  assert.ok(Math.abs(z.deriva(400)) <= ZZ_DERIVA_MAX + 1e-9, 'la deriva tiene que estar topada');
});

test('zigzag: el validador rechaza la data que no avisa sola', async () => {
  const z = await import('../src/core/zigzag.js');
  const { ZZ_LARGO_MIN } = await import('../src/data/tuning.js');
  assert.deepEqual(z.validarZigzag(undefined), [], 'sin zigzag es valido: casi ninguna mision lo lleva');
  assert.deepEqual(z.validarZigzag({ amp: 0.7, largo: 600, seed: 3 }), []);
  assert.deepEqual(z.validarZigzag({ trazado: [[400, 0], [600, -0.8]] }), []);
  const casos = [
    [{ amp: 1, trazado: [[400, 0]] }, 'las dos formas a la vez'],
    [{ largo: 600 }, 'procedural sin amp'],
    [{ amp: 2 }, 'amp fuera de rango'],
    [{ amp: 1, largo: ZZ_LARGO_MIN - 1 }, 'una curva mas corta que el minimo'],
    [{ amp: 1, desde: 0.9, hasta: 0.3 }, 'la ventana al reves'],
    [{ amp: 1, amplitud: 3 }, 'una clave mal escrita'],
    [{ trazado: [[400, 3]] }, 'curvatura fuera de [-1,1]'],
    [{ amp: 1, paredes: { alto: 2 } }, 'pared con alto invalido'],
    [{ amp: 1, paredes: { altura: 1 } }, 'pared con clave mal escrita'],
  ];
  for (const [data, por] of casos) {
    assert.ok(z.validarZigzag(data).length > 0, `tendria que rechazar ${por}: ${JSON.stringify(data)}`);
  }
});

test('zigzag: TODAS las misiones de la campaña traen data sana', async () => {
  const z = await import('../src/core/zigzag.js');
  const { MISSIONS } = await import('../src/data/missions.js');
  for (const m of MISSIONS) {
    const e = z.validarZigzag(m.zigzag);
    assert.equal(e.length, 0, `la mision ${m.id} tiene el zigzag mal: ${e.join(' · ')}`);
  }
});

// ================= LOS SOLDADOS HORNEADOS (PLAN_HORNEADO B7) =================
// El soldado dejo de venir de una lamina generada por IA y sale del horno, con la misma luz que
// todo lo demas. Lo que estas pruebas cuidan NO es el arte —eso se mira— sino el ENCUADRE: la hoja
// se ancla por la CELDA (todas las poses comparten camara y linea de suelo) en vez de por trece
// cajas medidas a mano, y ese contrato esta escrito en DOS archivos que nadie obliga a coincidir.

const numDe = (src, nombre) => {
  const m = src.match(new RegExp(`${nombre}\\s*=\\s*(-?[0-9.]+)`));
  assert.ok(m, `no se encontro '${nombre}'`);
  return parseFloat(m[1]);
};

test('soldados: el encuadre del horno y el del render son EL MISMO', () => {
  // SI ESTOS NUMEROS DIVERGEN NO HAY ERROR DE RUNTIME: el soldado simplemente queda flotando sobre
  // el pasto o enterrado hasta las rodillas, y eso se descubre mirando una captura meses despues.
  // Es el mismo tipo de bug que el autobox de B0 vino a matar para los enemigos; aca la hoja no
  // lleva cajas, asi que lo que hay que custodiar es el acuerdo entre el horneador y el dibujante.
  const horno = readFileSync(new URL('../tools/bake_soldiers.html', import.meta.url), 'utf8');
  const render = readFileSync(new URL('../src/render/soldiers.js', import.meta.url), 'utf8');
  for (const n of ['FW', 'FH', 'WU', 'PASOS']) {
    assert.equal(numDe(render, n), numDe(horno, n), `'${n}' no coincide entre el horno y el render`);
  }
  // el suelo se declara derivado en el horno (FH - 3) y literal en el render: se compara el valor
  assert.equal(numDe(render, 'SUELO'), numDe(horno, 'FH') - 4, 'la linea de suelo dejo de coincidir');
});

test('soldados: la hoja horneada tiene la grilla que el render espera', () => {
  // Lee el IHDR del PNG (ancho y alto, big endian en los bytes 16..24) sin decodificar la imagen.
  // Si alguien re-hornea con otra grilla —una pose mas, otro tamaño de celda— el render seguiria
  // recortando en las coordenadas viejas y sacaria medio soldado de cada celda.
  // El modulo NO se importa: crea un `Image()`, que en node no existe. Se leen sus constantes del
  // texto, que es lo mismo que hace la prueba de arriba y no obliga a meter un DOM falso.
  const render = readFileSync(new URL('../src/render/soldiers.js', import.meta.url), 'utf8');
  const FW = numDe(render, 'FW'), FH = numDe(render, 'FH');
  const PASOS = numDe(render, 'PASOS'), ARG = numDe(render, 'FILA_ARGENTINO');
  const png = readFileSync(new URL('../assets/world/soldats/soldados.png', import.meta.url));
  const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
  assert.equal(w, (PASOS + 1) * FW, 'la hoja no tiene las columnas que el render recorta');
  assert.equal(h, (ARG + 1) * FH, 'la hoja no tiene las tres filas (guarnicion, desembarco, conscripto)');
});

test('soldados: el que desembarca lleva bergen y el de guarnicion no', () => {
  // La fila de la hoja la elige `sd.bergen`, que pone systems/spawn.js. Si el dato deja de nacer,
  // el juego dibuja siempre la fila 0 y las dos filas horneadas se vuelven una sola — arte muerto
  // a medias, que es peor que arte muerto entero porque nadie lo nota.
  const spawn = readFileSync(new URL('../src/systems/spawn.js', import.meta.url), 'utf8');
  assert.ok(/bergen:\s*!!coast/.test(spawn), 'los soldados dejaron de declarar su equipo');
  const game = readFileSync(new URL('../src/game.js', import.meta.url), 'utf8');
  assert.ok(game.includes('sd.bergen'), 'el render de soldados dejo de mirar el equipo');
});

import { rebuild as zzRebuild, reset as zzReset, paredH as zzH, paredXAt as zzX,
  paredEntra as zzEntra, ladoActivo } from '../src/core/zigzag.js';

test('callejon: una COSTA deja el otro lado abierto de punta a punta', () => {
  // El pedido: poder tener tierra de UN solo lado (costa o acantilado) en vez de callejon. La
  // prueba no mira una muestra: barre kilometros, porque lo que se afirma es que del lado abierto
  // NUNCA hay roca — no que casi nunca.
  for (const [lado, dentro, fuera] of [['izq', -1, 1], ['der', 1, -1]]) {
    zzReset();
    zzRebuild(0, { amp: 0, largo: 800, seed: 3, paredes: { alto: 1, x: 46, lado } }, 0, 0);
    let hay = 0;
    for (let wz = 50; wz < 4000; wz += 7) {
      assert.equal(zzH(wz, fuera), 0, `${lado}: hay cerro del lado abierto en ${wz}`);
      assert.equal(zzEntra(wz, fuera), 0, `${lado}: hay punta del lado abierto en ${wz}`);
      if (zzH(wz, dentro) > 0) hay++;
    }
    assert.ok(hay > 400, `${lado}: casi no hay tierra del lado que si va (${hay})`);
    // ...y el lado abierto no puede topar nada: si `paredXAt` devolviera el borde de siempre,
    // el carril seguro y el tope de los que se mueven creerian que hay un muro invisible en 46.
    assert.ok(zzX(1000, fuera) > 200, 'el lado abierto tiene que quedar fuera de todo tope');
    assert.equal(ladoActivo(fuera), false);
    assert.equal(ladoActivo(dentro), true);
  }
  zzReset();
});

import { barreraDe, enBarrera } from '../src/core/zigzag.js';

test('barreras: el puente de madera deja pasar por abajo y mata en el tablero', () => {
  // Reemplaza al test del ARCO DE ROCA, que se saco junto con la piel: se dibujaba como una placa
  // a una sola profundidad y se leia como una figurita pegada delante del pasillo (ver
  // ZZ_BARR_MADERA en data/tuning.js). Lo que se afirma acá es lo mismo que se afirmaba de aquel:
  // que el hueco por el que hay que pasar EXISTE y que el macizo cierra.
  zzReset();
  zzRebuild(0, { amp: 0, largo: 800, seed: 3, paredes: { alto: 1, x: 46, mata: true, barreras: 'madera' } }, 0, 0, 2);
  let b = null;
  for (let wz = 100; wz < 4000 && !b; wz += 2) b = barreraDe(wz);
  assert.ok(b && b.tipo === 'madera', 'no aparecio ningun puente de madera');
  const wz = (b.z0 + b.z1) / 2;
  assert.ok(enBarrera(0, (b.y0 + b.y1) / 2, wz), 'el tablero no mata');
  assert.equal(enBarrera(0, b.y0 - 3, wz), null, 'no se puede pasar por abajo del tablero');
  assert.equal(enBarrera(0, b.y1 + 3, wz), null, 'no se puede pasar por encima');
  // y el hueco de abajo tiene que entrar un avion: si el tablero cuelga a cinco metros, no es una
  // barrera, es una pared con un chiste adentro
  assert.ok(b.y0 >= 10, `el tablero cuelga a ${b.y0} m: no entra el avion`);
  zzReset();
});

test('barreras: la perilla manda — NINGUNA no trae ni una, y una COSTA sola tampoco', () => {
  // Son las dos mitades que hacen que la perilla sea una perilla. Sin la primera, apagarlas seria
  // imposible; sin la segunda, una barrera cerraria un pasillo que no existe y el jugador la
  // rodearia por el mar abierto sin enterarse de que era una barrera.
  const spec = { amp: 0, largo: 800, seed: 3, paredes: { alto: 1, x: 46, mata: true, barreras: 'mezcla' } };
  const contar = (sp, dens) => {
    zzReset(); zzRebuild(0, sp, 0, 0, dens);
    let n = 0;
    for (let wz = 100; wz < 9000; wz += 11) if (barreraDe(wz)) n++;
    return n;
  };
  assert.equal(contar(spec, 0), 0, 'con NINGUNA sigue habiendo barreras');
  const pocas = contar(spec, 1), muchas = contar(spec, 2);
  assert.ok(pocas > 0, 'con POCAS no hay ninguna');
  assert.ok(muchas > pocas * 1.4, `MUCHAS (${muchas}) tiene que ser bastante mas que POCAS (${pocas})`);
  const costa = { ...spec, paredes: { ...spec.paredes, lado: 'izq' } };
  assert.equal(contar(costa, 2), 0, 'con una costa sola aparecen barreras');
  zzReset();
});

test('barreras: el manojo de cables MATA (el margen no puede comerse la franja)', () => {
  // Con el margen fijo en 1.2 a cada lado, una franja de 4.5 m quedaba con el hueco invertido y
  // no mataba NUNCA: la barrera mas fina del juego era la unica que no existia.
  zzReset();
  zzRebuild(0, { amp: 0, largo: 800, seed: 3, paredes: { alto: 1, x: 46, mata: true, barreras: 'cables' } }, 0, 0, 2);
  let b = null;
  for (let wz = 100; wz < 4000 && !b; wz += 2) b = barreraDe(wz);
  assert.ok(b && b.tipo === 'cables', 'no aparecio ningun tendido');
  const wz = (b.z0 + b.z1) / 2;
  assert.ok(enBarrera(0, (b.y0 + b.y1) / 2, wz), 'el manojo de cables no mata');
  assert.equal(enBarrera(0, b.y0 - 3, wz), null, 'no se puede pasar por debajo del cable');
  assert.equal(enBarrera(0, b.y1 + 3, wz), null, 'no se puede pasar por encima del cable');
  zzReset();
});

test('callejon: `ambos` es EXACTAMENTE el callejon de siempre', () => {
  // La garantia de la extension: la data que ya existe no cambia ni un metro. Se compara el
  // trazado sin `lado` contra el mismo con `lado: ambos`, muestra por muestra y con `Object.is`.
  const base = { amp: 0, largo: 800, seed: 9, paredes: { alto: 1, x: 46 } };
  const conLado = { amp: 0, largo: 800, seed: 9, paredes: { alto: 1, x: 46, lado: 'ambos' } };
  const leer = spec => {
    zzReset(); zzRebuild(0, spec, 0, 0);
    const o = [];
    for (let wz = 50; wz < 3000; wz += 11) for (const l of [-1, 1]) o.push(zzH(wz, l), zzX(wz, l));
    return o;
  };
  const a = leer(base), b = leer(conLado);
  for (let i = 0; i < a.length; i++) assert.ok(Object.is(a[i], b[i]), `difieren en ${i}: ${a[i]} vs ${b[i]}`);
  zzReset();
});

import { alfaCielo } from '../src/systems/fog.js';

test('niebla: sin callejon, el cielo es EXACTAMENTE el de siempre', () => {
  // La garantia del arreglo del canon: sobre mar abierto no cambia un solo pixel. Se compara con
  // `Object.is` y no con una tolerancia — lo que se afirma es que es la MISMA cuenta, no una
  // parecida (misma regla que el cero exacto del zigzag).
  for (let i = 0; i <= 10; i++) {
    const u = i / 10;
    for (const t of [0, 0.3, 1]) {
      assert.ok(Object.is(alfaCielo(u, t, 0), 0.55 + 0.4 * u * u),
        `u=${u} t=${t}: ${alfaCielo(u, t, 0)}`);
    }
  }
});

test('niebla: adentro del callejon la bruma SE ABRE hacia arriba', () => {
  // Es el bug entero: con la cuenta del cielo, arriba del horizonte quedaba una chapa plana y
  // cerrada que borraba la ladera. Adentro del canon tiene que ser lo contrario — cerrada contra
  // el horizonte, abriendose con la altura — y ademas MONOTONA, para que no aparezca una banda.
  let prev = Infinity;
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const a = alfaCielo(1 - t, t, 1);
    assert.ok(a < prev, `no se abre en t=${t}: ${a} >= ${prev}`);
    prev = a;
  }
  // pegada al horizonte es casi opaca: ahi se mira a lo largo de kilometros de banco
  assert.ok(alfaCielo(1, 0, 1) > 0.9, 'el horizonte tiene que quedar cerrado');
  // y arriba del todo no queda nada: por ahi se sale del banco
  assert.ok(alfaCielo(0, 1, 1) < 0.02, 'arriba tiene que abrirse del todo');
});

test('niebla: el canon MEZCLA, no conmuta', () => {
  // `cn` sale de cuanta roca asoma sobre el horizonte, y esa cantidad crece y decrece sola con la
  // ventana del trazado y con la altura del avion. Si el perfil saltara de una cuenta a la otra,
  // el cielo cambiaria de golpe en pleno vuelo — que es la clase de parpadeo que este item ya
  // se comio dos veces.
  const a0 = alfaCielo(0.8, 0.2, 0), a1 = alfaCielo(0.8, 0.2, 1);
  const medio = alfaCielo(0.8, 0.2, 0.5);
  assert.ok(Math.abs(medio - (a0 + a1) / 2) < 1e-9, `la mezcla no es lineal: ${medio}`);
});

// ================= LA CHANCHA (PLAN_HORNEADO B7b) =================
test('chancha: la hoja trae las seis anclas que el render dibuja encima', async () => {
  // Las helices y la manguera NO se hornean —un disco quieto se ve muerto, y la manguera se mueve—
  // asi que se pintan por codigo sobre el sprite. Donde van lo mide el horno proyectando puntos
  // del modelo con la misma camara con la que horneo. Si el modelo mueve un motor y la hoja no se
  // re-hornea, o si alguien saca un ancla, las helices quedan flotando al lado de sus gondolas y
  // la manguera vuelve a nacer en la panza — dos cosas que ningun error de runtime delata.
  const { CAJAS } = await import('../src/data/cajas.js');
  const p = CAJAS.chancha.puntos;
  assert.ok(Array.isArray(p) && p.length === 6,
    'la Chancha tiene que declarar 4 helices + la boca de los dos pods');
  // las cuatro helices estan a la MISMA altura y simetricas respecto del centro del frame
  const cx = CAJAS.chancha.fw / 2;
  assert.equal(p[0][1], p[3][1], 'las helices dejaron de estar a la misma altura');
  assert.ok(Math.abs((p[0][0] + p[3][0]) / 2 - cx) < 1.5, 'las helices externas no son simetricas');
  assert.ok(Math.abs((p[1][0] + p[2][0]) / 2 - cx) < 1.5, 'las helices internas no son simetricas');
  // el pod 4 es el de ESTRIBOR (+x, a la derecha del centro) y el 5 su espejo de babor
  assert.ok(p[4][0] > cx, 'la boca del pod dejo de estar en el ala de estribor');
  assert.ok(Math.abs((p[4][0] + p[5][0]) / 2 - cx) < 1.5 && p[4][1] === p[5][1], 'los dos pods no son simetricos');
  // y van AFUERA del motor externo, como en el KC-130 (8/10): la boca, mas lejos del eje que la helice
  assert.ok(p[4][0] > p[3][0], 'el pod de estribor volvio adentro del motor externo');
  // LA CANASTA SALE DEL POD: CH_HOSE_X (metros de mundo) es la x de la boca en la hoja. Si se mueve
  // el pod en el modelo y no esto, la manguera cruza en diagonal por abajo del ala
  const { CH_HOSE_X } = await import('../src/data/tuning.js');
  // el ancho de mundo de la hoja (`chancha: { wu }` de render/enemies.js), leido del fuente: el
  // modulo carga imagenes y no se importa en node
  const wu = +readFileSync(new URL('../src/render/enemies.js', import.meta.url), 'utf8').match(/chancha: \{ wu: ([\d.]+) \}/)[1];
  const b = CAJAS.chancha.box, cw = b.x1 - b.x0 + 1;
  const podX = (p[4][0] - (b.x0 + cw / 2)) * wu / cw;
  assert.ok(Math.abs(podX - CH_HOSE_X) < 0.4, `CH_HOSE_X ${CH_HOSE_X} y la boca del pod (${podX.toFixed(2)} m) no coinciden`);
});

test('chancha: el render usa las anclas y no fracciones a ojo', () => {
  const r = readFileSync(new URL('../src/render/chancha.js', import.meta.url), 'utf8');
  assert.ok(r.includes("anclaje('chancha'"), 'el render volvio a poner las helices a ojo');
  assert.ok(/anclaje\('chancha', 4,/.test(r), 'la manguera dejo de salir del pod');
  // y el alabeo sale de la MISMA formula que la deriva de systems/chancha.js, no de un seno nuevo
  assert.ok(r.includes('CH_DERIVA_V'), 'el alabeo de la Chancha dejo de atarse a su deriva');
});

// ---- EL AGUANTE: el estado RASANTE (core/aguante.js) -----------------------------------------
// Lo que se prueba no son las constantes —esas se tunean— sino las tres propiedades que hacen que
// la mecanica sea jugable: que la dificultad SUBA siempre, que el margen para acertar nunca se
// vuelva imposible, y que el sector nuevo de verdad se corra del anterior.

test('aguante: la dificultad sube con cada acierto y no se pasa de los topes', async () => {
  const { AGU, ancho, vel, mult, nivel, margen } = await import('../src/core/aguante.js');
  for (let n = 0; n < 40; n++) {
    assert.ok(ancho(n + 1) <= ancho(n), `el sector crecio entre ${n} y ${n + 1}`);
    assert.ok(vel(n + 1) >= vel(n), `el indicador se frenó entre ${n} y ${n + 1}`);
    assert.ok(mult(n + 1) >= mult(n), `el multiplicador bajo entre ${n} y ${n + 1}`);
    assert.ok(ancho(n) >= AGU.SEC_MIN - 1e-9, `el sector se fue abajo del piso en ${n}`);
    assert.ok(vel(n) <= AGU.VEL_MAX + 1e-9, `el indicador se paso del tope en ${n}`);
    assert.ok(mult(n) <= AGU.MULT_TOPE + 1e-9, `el multiplicador se paso del tope en ${n}`);
    assert.ok(nivel(n) <= AGU.NIVEL_TOPE, `el escalon se paso de 4 en ${n}`);
  }
  assert.equal(mult(0), AGU.MULT, 'recien entrado tiene que pagar el x10 de la banda');
  assert.equal(nivel(0), 0, 'recien entrado el escalon de la fisica es cero');
  // EL MARGEN para acertar es la dificultad de verdad, y tiene que bajar pero no desaparecer: dos
  // cuadros a 60 fps son 33 ms, y abajo de eso el juego pasa a ser de suerte.
  assert.ok(margen(0) > margen(20), 'el margen no se cerro con los aciertos');
  assert.ok(margen(999) > 0.05, `el margen quedo imposible: ${margen(999)} s`);
});

test('aguante: la ventana se cierra, pero siempre deja saltear al menos una pasada', async () => {
  const { AGU, ventana, pasadasSalteables } = await import('../src/core/aguante.js');
  for (let n = 0; n < 40; n++) {
    assert.ok(ventana(n + 1) <= ventana(n), `la ventana crecio entre ${n} y ${n + 1}`);
    assert.ok(ventana(n) >= AGU.VEN_MIN - 1e-9, `la ventana se fue abajo del piso en ${n}`);
  }
  assert.equal(ventana(0), AGU.VEN0, 'recien entrado la ventana tiene que estar entera');
  // LA ESCALADA SE MIDE EN PASADAS SALTEABLES y no en segundos: al acelerar el indicador las
  // pasadas llegan mas seguido, asi que una ventana fija dejaria saltear cada vez MAS. Esto es lo
  // que se rompe si alguien toca VEN_K sin mirar VEL_K, y es justo el error que no se ve jugando.
  assert.ok(pasadasSalteables(0) > pasadasSalteables(20),
    'la ventana dejo de apretar: con los aciertos se pueden saltear MAS pasadas que al principio');
  // …y nunca tan poco como tener que acertar todas: eso seria volver al machaque que se saco.
  for (let n = 0; n < 40; n++)
    assert.ok(pasadasSalteables(n) > 1, `en ${n} aciertos hay que acertar todas las pasadas`);
});

test('aguante: errar quema reloj, y tres errores seguidos vacian la ventana', async () => {
  const { AGU, ventana, castigo, toquesMalos } = await import('../src/core/aguante.js');
  for (let n = 0; n < 40; n++) {
    assert.ok(castigo(n) > 0, `en ${n} aciertos errar no cuesta nada`);
    assert.ok(castigo(n) < ventana(n), `en ${n} aciertos un solo error vacia la ventana entera`);
    // EL MACHAQUE TIENE QUE MORIR: si errar sale casi gratis, apretar el gas sin parar acierta de
    // casualidad cada tanto y el estado se sostiene solo. Tres errores seguidos = afuera.
    assert.ok(toquesMalos(n) <= 3, `en ${n} aciertos hacen falta ${toquesMalos(n)} errores: machacar sale gratis`);
    // …y tampoco puede matar de uno: el pedido era justamente que un toque nervioso no borre todo.
    assert.ok(toquesMalos(n) >= 2, `en ${n} aciertos un solo error mata`);
  }
  // el castigo es FRACCION de la ventana, asi que pesa lo mismo al entrar que en la meseta
  const p0 = castigo(0) / ventana(0), p9 = castigo(30) / ventana(30);
  assert.ok(Math.abs(p0 - p9) < 1e-9, 'el castigo dejo de ser proporcional a la ventana');
  assert.ok(AGU.GRACIA > 0.2, 'la gracia de la entrada tiene que alcanzar para un reflejo (>200 ms)');
});

test('aguante: el indicador va y vuelve sin saltos, y a velocidad constante', async () => {
  const { pos } = await import('../src/core/aguante.js');
  assert.ok(Math.abs(pos(0) - 0) < 1e-9, 'la fase 0 tiene que arrancar en una punta');
  assert.ok(Math.abs(pos(1) - 1) < 1e-9, 'media vuelta tiene que llegar a la otra punta');
  assert.ok(Math.abs(pos(2) - 0) < 1e-9, 'la vuelta entera tiene que volver al arranque');
  assert.ok(Math.abs(pos(-0.25) - 0.25) < 1e-9, 'una fase negativa tiene que seguir dando 0..1');
  // TRIANGULAR y no seno: pasos iguales de fase = pasos iguales de posicion. Es lo que hace que
  // la ventana dure lo mismo en cualquier sector, y por eso el sector se puede sortear.
  const d = [];
  for (let i = 0; i < 10; i++) d.push(pos((i + 1) * 0.1) - pos(i * 0.1));
  for (const x of d) assert.ok(Math.abs(x - d[0]) < 1e-9, 'el indicador dejo de ir a velocidad constante');
  for (let f = 0; f < 6; f += 0.013) {
    const p = pos(f);
    assert.ok(p >= 0 && p <= 1, `el indicador se salio de la barra en la fase ${f}: ${p}`);
  }
});

test('aguante: el sector nuevo se corre del anterior y nunca se sale de la barra', async () => {
  const { AGU, ancho, sector, dentro } = await import('../src/core/aguante.js');
  for (let n = 0; n < 20; n++) {
    const w = ancho(n);
    let prev = -1;
    for (let k = 0; k < 200; k++) {
      const s = sector(w, (k * 0.0137 + n * 0.031) % 1, prev);
      assert.ok(s >= 0 && s + w <= 1 + 1e-9, `el sector se salio de la barra: ${s}+${w}`);
      if (prev >= 0) {
        const sep = Math.min(AGU.SEP, (1 - w) / 2);
        assert.ok(Math.abs(s - prev) >= sep - 1e-9,
          `el sector nuevo quedo encima del anterior (n=${n}): ${prev} -> ${s}`);
      }
      prev = s;
    }
  }
  // y `dentro` es el mismo criterio que usa el sistema para armar y para acertar
  assert.ok(dentro(0.5, 0.4, 0.2), 'el medio del sector tiene que contar como adentro');
  assert.ok(!dentro(0.39, 0.4, 0.2), 'justo antes del sector no puede contar');
  assert.ok(!dentro(0.61, 0.4, 0.2), 'justo despues del sector no puede contar');
});

// ================= LAS ANCLAS DE LAS HOJAS DE AVIONES =================
// Las puntas de ala y la boca del escape dejaron de ser tablas a mano en render/plane.js y pasan a
// medirse en el horneado (src/data/anclas.js). Lo que sigue cuida el contrato: la forma del dato,
// que las dos hojas lo tengan, y que nadie vuelva a pegar una tabla a mano al lado.

test('anclas: las dos hojas traen la grilla entera medida', async () => {
  const { ANCLAS } = await import('../src/data/anclas.js');
  for (const hoja of ['base', 'ras']) {
    const A = ANCLAS[hoja];
    assert.ok(A, `falta la hoja '${hoja}'`);
    for (const campo of ['tips', 'tob', 'box']) {
      assert.equal(A[campo].length, 3, `'${hoja}.${campo}' tiene que tener 3 filas de cabeceo`);
      for (const fila of A[campo]) assert.equal(fila.length, 9, `'${hoja}.${campo}' tiene que tener 9 alabeos`);
    }
    assert.ok(A.alto > 0.05 && A.alto < 0.95, `'${hoja}.alto' fuera de rango: ${A.alto}`);
    // la caja tiene que estar ordenada: arriba antes que abajo, o el tope de los parches se da vuelta
    for (const fila of A.box) for (const b of fila) assert.ok(b[0] < b[1], `caja al reves en '${hoja}': ${b}`);
  }
});

test('anclas: la punta de ala esta DONDE TERMINA EL ALA, no en el borde del frame', () => {
  // Una tabla de puntas que diera el borde del frame no seria una medicion: seria un rectangulo.
  // El aire que el frame deja alrededor es justamente lo que permite alabear sin cortarse.
  return import('../src/data/anclas.js').then(({ ANCLAS }) => {
    for (const hoja of ['base', 'ras']) {
      for (const fila of ANCLAS[hoja].tips) for (const t of fila) {
        assert.ok(t[0] > -0.5 && t[2] < 0.5, `punta fuera del frame en '${hoja}': ${t}`);
      }
      // LA ENVERGADURA SOLO SE EXIGE EN LA POSE NIVELADA, y la primera version de esta prueba se
      // equivoco pidiendola en las 27. Alabeado 60° el ala se ve DE CANTO —y en la hoja del poder,
      // ademas, escorzada por el yaw— asi que su ancho proyectado se cae a 0.13 con todo derecho.
      // Exigir 0.2 en todas era pedirle a la medicion que mintiera justo donde el ala se para.
      const N = ANCLAS[hoja].tips[1][4];
      assert.ok(N[2] - N[0] > 0.2, `el ala nivelada de '${hoja}' salio demasiado angosta: ${N}`);
    }
  });
});

test('anclas: el render las USA y no volvio a una tabla a mano', () => {
  // ESTA PRUEBA EXISTE POR LA NOTA QUE TENIA LA TABLA VIEJA: "si se re-hornea la hoja con otra
  // geometria de ala, hay que volver a medir esta tabla". Esa nota describe un dato que se pudre
  // solo. Si alguien vuelve a pegar los numeros aca, esto lo dice.
  const src = readFileSync(new URL('../src/render/plane.js', import.meta.url), 'utf8');
  assert.ok(src.includes("import { ANCLAS } from '../data/anclas.js'"), 'plane.js dejo de leer las anclas medidas');
  assert.ok(src.includes('const TIPS = ANCLAS.base.tips'), 'volvio a haber una tabla de puntas a mano');
  assert.ok(/AN\.tob\[rowPose\]\[colPose\]/.test(src), 'la tobera volvio a un ancla fija');
  // y el TOPE de los parches, que es lo que impide que una chapa quede flotando en el cielo.
  // Se recorta contra la SILUETA (`perfil`) y no contra la caja: adentro de un rectangulo todavia
  // hay cielo, y ahi fue donde quedaron flotando tres de los doce en la primera version.
  assert.ok(/AN\.perfil\[/.test(src), 'los parches perdieron su tope contra la silueta');
});

// ================= EL RUMBO DE LAS BANDADAS =================
test('aves: hay bandadas quietas, pero no todas', async () => {
  // El pedido fue literal: "algunos si estaticos pero no todos y no siempre". Eso es una
  // PROPORCION, no un booleano, y lo que hay que cuidar es que no se vaya a ninguno de los dos
  // extremos: un cielo donde todo se mueve cansa igual que uno donde nada se mueve.
  const { rumboAve, AVES_QUIETAS } = await import('../src/data/tuning.js');
  let quietas = 0;
  const N = 4000;
  for (let i = 0; i < N; i++) {
    const r = rumboAve();
    if (!r.bvx && !r.bvy && !r.bvz) quietas++;
  }
  const p = quietas / N;
  assert.ok(p > 0.05, `casi ninguna bandada queda quieta (${(p * 100).toFixed(1)}%)`);
  assert.ok(p < 0.6, `demasiadas bandadas quietas (${(p * 100).toFixed(1)}%)`);
  assert.ok(Math.abs(p - AVES_QUIETAS) < 0.06, `la proporcion no sigue a AVES_QUIETAS (${p.toFixed(3)} vs ${AVES_QUIETAS})`);
});

test('aves: vuelan en los TRES ejes, y en diagonal', async () => {
  // La version anterior solo tenia deriva lateral, asi que todas las aves del juego hacian lo
  // mismo en el mismo eje. Lo que esta prueba cuida no es un numero: es que los tres ejes existan
  // y que se COMBINEN — una bandada con dos ejes cruza en diagonal sin que nadie escriba el caso.
  const { rumboAve, AVES_VX, AVES_VY, AVES_VZ } = await import('../src/data/tuning.js');
  let ejes = { x: 0, y: 0, z: 0 }, diagonales = 0, tresEjes = 0;
  for (let i = 0; i < 4000; i++) {
    const r = rumboAve();
    if (r.bvx) ejes.x++; if (r.bvy) ejes.y++; if (r.bvz) ejes.z++;
    const n = (r.bvx ? 1 : 0) + (r.bvy ? 1 : 0) + (r.bvz ? 1 : 0);
    if (n >= 2) diagonales++;
    if (n === 3) tresEjes++;
    assert.ok(Math.abs(r.bvx) <= AVES_VX && Math.abs(r.bvy) <= AVES_VY && Math.abs(r.bvz) <= AVES_VZ,
      `una bandada salio mas rapida que su tope: ${JSON.stringify(r)}`);
  }
  for (const e of ['x', 'y', 'z']) assert.ok(ejes[e] > 400, `el eje ${e} casi no se usa (${ejes[e]}/4000)`);
  assert.ok(diagonales > 800, `casi no hay bandadas en diagonal (${diagonales}/4000)`);
  assert.ok(tresEjes > 100, `nunca se combinan los tres ejes (${tresEjes}/4000)`);
});

test('aves: no bajan a la banda del x10 — eso es diseño, no un numero suelto', async () => {
  // El piso de las aves es el techo de la racha rasante. Volar pegado al agua es de donde sale el
  // puntaje Y la carga del poder RASANTE: poblar esa banda de obstaculos seria castigar
  // exactamente lo que el juego pide que hagas. Si alguien baja el piso, esto lo dice.
  // Medía contra CAZA_RAS_ALT, que da 4,5 de casualidad: la banda de verdad es BANDA_ALT.
  const { SPAWN_Y, AVES_PISO, AVES_TECHO, BANDA_ALT } = await import('../src/data/tuning.js');
  assert.ok(SPAWN_Y.birds[0] >= BANDA_ALT, `las aves nacen dentro de la banda del x10 (${SPAWN_Y.birds[0]} < ${BANDA_ALT})`);
  assert.ok(AVES_PISO >= BANDA_ALT, `el piso de las aves entro en la banda del x10 (${AVES_PISO})`);
  // y la banda de nacimiento tiene que ser ANCHA: el problema original era que todas aparecian a
  // la misma altura porque nacian en cinco metros de franja
  assert.ok(SPAWN_Y.birds[1] - SPAWN_Y.birds[0] > 12, 'las aves volvieron a nacer todas a la misma altura');
  assert.ok(AVES_TECHO >= SPAWN_Y.birds[1], 'el techo de vuelo de las aves es mas bajo que su altura de nacimiento');
});

test('la banda del x10 es UN solo numero', async () => {
  // El techo de la banda estuvo escrito a mano en nueve lugares —puntaje, carga del poder, estado
  // del aguante, cortinas, rocio, sonido y HUD— y coincidian de memoria, no por construccion.
  const { BANDA_ALT, CORTINA_ALT, CAZA_RAS_ALT, RAS_ALT } = await import('../src/data/tuning.js');
  const { multOf } = await import('../src/core/util.js');
  assert.equal(multOf(BANDA_ALT), 10, 'el techo de la banda no paga x10');
  assert.equal(multOf(BANDA_ALT + 0.01), 5, 'un centimetro arriba del techo sigue pagando x10');
  assert.equal(CORTINA_ALT, BANDA_ALT, 'las cortinas dejaron de marcar la banda: son su instrumento');
  // "una sola banda, dos premios": a ras te paga el x10 Y el Harrier pierde la punteria. Si alguien
  // los separa que sea a proposito —escribiendo un numero en CAZA_RAS_ALT— y no por descuido.
  assert.equal(CAZA_RAS_ALT, BANDA_ALT, 'el santuario del Harrier se separo de la banda del x10');
  // Y EL CASO HISTORICO, al reves: RAS_ALT (la altura a la que el PODER asienta el avion) tiene que
  // quedar ADENTRO de la banda. Si sube por encima, el poder te saca del x10 mientras lo usas.
  assert.ok(RAS_ALT < BANDA_ALT, `el asiento del poder quedo FUERA de la banda (${RAS_ALT} >= ${BANDA_ALT})`);
});

test('PERFECTO carga por ENCIMA de la banda, no por debajo', async () => {
  // Los dos techos se separaron el 15/9: el x10 termina en BANDA_ALT y PERFECTO llega a PERF_ALT,
  // mas arriba, para que entrar al estado no dependa de que no pase una ola. Son numeros distintos
  // A PROPOSITO — lo que esta prueba impide es que alguien invierta la relacion, que dejaria una
  // franja de la banda del x10 donde el estado NO se puede cargar: cobrarias el maximo sin poder
  // empezar la unica mecanica que vive ahi.
  const { BANDA_ALT, PERF_ALT, RAS_ALT } = await import('../src/data/tuning.js');
  assert.ok(PERF_ALT >= BANDA_ALT, `PERFECTO no llega al techo del x10 (${PERF_ALT} < ${BANDA_ALT})`);
  assert.ok(RAS_ALT < PERF_ALT, 'el asiento del poder quedo fuera de donde PERFECTO carga');
});

test('nadie vuelve a escribir la banda a mano', () => {
  // EL CENTINELA. Lo de arriba prueba que los numeros de hoy concuerdan; esto impide que mañana
  // aparezca un decimo sitio. Solo mira COMPARACIONES DE ALTURA (`plane.y <= 4.5`, `alt < 4.5`),
  // que es lo que lo vuelve inmune a los ~55 hermanos del 4,5 que hay en el repo y NO son la banda:
  // el calibre del canon de 4,5" de los Tipo 42, el arrastre lateral (`1 - 4.5 * dt`), CAZA_WINDOW
  // en segundos, el alto de un galpon, velocidades verticales negativas.
  const re = /(plane\.y|\.y|\balt)\s*<=?\s*4\.5(?![0-9])/;
  const raiz = new URL('../src/', import.meta.url);
  const malas = [];
  (function ver(dir, rel) {
    for (const e of readdirSync(new URL(dir, raiz), { withFileTypes: true })) {
      if (e.isDirectory()) { if (e.name !== 'vendor') ver(`${dir}${e.name}/`, `${rel}${e.name}/`); continue; }
      if (!e.name.endsWith('.js') || e.name === 'game.bundle.js') continue;
      readFileSync(new URL(`${dir}${e.name}`, raiz), 'utf8').split('\n').forEach((l, i) => {
        // se saltean los comentarios (una prueba que falla por prosa se termina desactivando) y las
        // lineas marcadas a mano: hoy solo el sacudon del rocio, que es cercania al agua y no plata
        if (re.test(l) && !l.trimStart().startsWith('//') && !l.includes('no es la banda'))
          malas.push(`${rel}${e.name}:${i + 1}`);
      });
    }
  })('', '');
  assert.deepEqual(malas, [], `la banda escrita a mano — importa BANDA_ALT de data/tuning.js en: ${malas.join(', ')}`);
});

test('anclas: la perilla de AJUSTES a mano PISA lo que midio el horno', async () => {
  // El horno mide bien, pero no todo lo que se mide se ve bien — este proyecto ya lo aprendio tres
  // veces con la hoja del poder. Por eso la medicion es la base y no la ultima palabra, y Matias
  // pidio explicitamente "dame opcion de elegir manualmente y los ajusto yo en el inclinado a 45".
  // Esta prueba cuida que esa puerta siga abierta: si alguien "simplifica" el merge, el ajuste a
  // mano se pierde en silencio en la proxima horneada y nadie se entera hasta mirar una captura.
  const mano = readFileSync(new URL('../src/data/anclas.js', import.meta.url), 'utf8');
  assert.ok(mano.includes("import { HORNO } from './anclas_horno.js'"), 'anclas.js dejo de leer lo medido');
  assert.ok(/export const AJUSTES/.test(mano), 'se perdio la tabla de ajustes a mano');
  assert.ok(/AJUSTES\[`\$\{hoja\}\/\$\{r\}\/\$\{c\}`\]/.test(mano), 'los ajustes ya no se aplican por celda');
  // y el generado NO puede traer ajustes adentro: se reescribe entero en cada horneada
  const horno = readFileSync(new URL('../src/data/anclas_horno.js', import.meta.url), 'utf8');
  assert.ok(!horno.includes('AJUSTES'), 'el archivo generado se contamino con ajustes a mano');
  assert.ok(horno.includes('GENERADO, NO EDITAR A MANO'), 'el generado perdio su cartel');
});

test('anclas: el perfil de la silueta cubre el ancho y esta ordenado', async () => {
  // Es el tope de los parches. Si una franja viniera al reves (abajo antes que arriba) el recorte
  // se daria vuelta y el parche saldria disparado al borde opuesto.
  const { ANCLAS } = await import('../src/data/anclas.js');
  for (const hoja of ['base', 'ras']) {
    const P = ANCLAS[hoja].perfil;
    assert.ok(P.length >= 9, `'${hoja}' tiene muy pocas franjas de perfil (${P.length})`);
    let conAvion = 0;
    for (const f of P) { if (f[1] > f[0]) conAvion++; }
    assert.ok(conAvion >= P.length * 0.5, `'${hoja}': el avion ocupa muy pocas franjas (${conAvion}/${P.length})`);
  }
});

// LA SUELTA SOBRE EL BUQUE (data/blanco.js, 23/9). La luz de SOLTA simula la bomba con la misma
// integracion que collision.js: si esto se rompe, el HUD miente sobre donde cae.
test('suelta: la altura decide — al ras no arma, a 11 m y a tiro pega en maquinas', async () => {
  const { blanco, resetBlanco, predecir, altoEn, zonaEn } = await import('../src/core/blanco.js');
  const { BL } = await import('../src/data/blanco.js');
  resetBlanco(true, 'HMS ARDENT', 't21');
  assert.equal(altoEn(BL.X + BL.LEN), -1, 'fuera de la eslora no hay casco');
  assert.ok(altoEn(BL.X) > 10, 'el centro de la t21 tiene superestructura');
  assert.equal(zonaEn(BL.X), 'centro');
  assert.equal(zonaEn(BL.X + BL.LEN * 0.4), 'extremo');
  // a crucero (60) y al ras: la bomba no vuela lo suficiente para armarse, en ninguna distancia
  const alRas = [60, 90, 120, 150, 200].map(d => predecir(0, 2.5, 0, 0, 60, 14 + d));
  assert.ok(!alRas.includes('centro') && !alRas.includes('extremo'), 'al ras nunca pega armada: ' + alRas);
  // a 11 m hay UNA ventana: muy cerca llega dormida, muy lejos cae corta, en el medio pega
  const a11 = d => predecir(0, 11, 0, 0, 60, 14 + d);
  assert.equal(a11(60), 'dormida');
  assert.equal(a11(160), 'centro');
  assert.equal(a11(400), 'corta');
  // corrida al costado: fuera de la eslora
  assert.equal(predecir(BL.LEN, 11, 0, 0, 60, 14 + 160), 'costado');
  blanco.on = false;
});

// LA BOMBA DEL BUQUE (data/cargas.js, 23/9): en las misiones contra un buque todo avion lleva la del
// centro. El ala se respeta; el centro se fuerza a bomba.
test('suelta: la carga siempre trae la bomba del centro, y el ala se respeta', async () => {
  const { conBombaCentral, cargaDe } = await import('../src/data/cargas.js');
  for (const [de, a] of [['tanques', 'tanques_bomba'], ['tres_tanques', 'tanques_bomba'], ['nada', 'bomba'],
    ['tanque', 'bomba'], ['dos_bombas', 'tres_bombas'], ['bombas_tanque', 'tres_bombas'],
    ['tanques_bomba', 'tanques_bomba'], ['tres_bombas', 'tres_bombas']]) {
    assert.equal(conBombaCentral(de), a, de + ' deberia quedar ' + a);
    assert.equal(cargaDe(conBombaCentral(de)).centro, 'bomba');
    assert.equal(cargaDe(conBombaCentral(de)).ala, cargaDe(de).ala, de + ': el ala no se toca');
  }
});

// ---------- LA NAFTA COMO ALCANCE (src/core/nafta.js, PLAN_NAFTA_ALCANCE N0) ----------
test('nafta: la capacidad sale de los tanques de la carga', async () => {
  const { capacidadKm, tanqueInicial, kmQuedan } = await import('../src/core/nafta.js');
  const { TANQUE_INTERNO_KM, TANQUE_EXTRA_KM } = await import('../src/data/tuning.js');
  assert.equal(capacidadKm('tres_bombas'), TANQUE_INTERNO_KM);
  assert.equal(capacidadKm('bomba'), TANQUE_INTERNO_KM);
  assert.equal(capacidadKm('tanques_bomba'), TANQUE_INTERNO_KM + 2 * TANQUE_EXTRA_KM);
  for (const id of ['tres_bombas', 'bomba', 'tanques_bomba', 'tres_tanques'])
    assert.equal(kmQuedan(tanqueInicial(id)), capacidadKm(id), id + ': el tanque lleno es la capacidad');
});

test('nafta: se quema primero lo de afuera, parejo, y despues el interno', async () => {
  const { tanqueInicial, gastar, kmQuedan } = await import('../src/core/nafta.js');
  const t0 = tanqueInicial('tanques_bomba');
  const t1 = gastar(t0, 300);
  near(t1.tanques[0], t1.tanques[1]);                 // los dos de ala chupan juntos
  near(t1.interno, t0.interno);                       // el interno ni se toco
  near(kmQuedan(t1), kmQuedan(t0) - 300);
  assert.equal(t0.tanques[0], 450, 'gastar no muta el tanque que recibe');
  const t2 = gastar(t1, 700);                         // vacia los externos y entra al interno
  assert.deepEqual(t2.tanques, [0, 0]);
  near(t2.interno, t0.interno - 100);
  const seco = gastar(t2, 1e6);                       // nunca por debajo de cero
  assert.equal(kmQuedan(seco), 0);
  // un externo que se seco antes (soltado y vuelto a sumar, o lo que sea) pasa su parte al otro
  const t3 = gastar({ tanques: [50, 400], interno: 1700 }, 200);
  near(t3.tanques[0], 0); near(t3.tanques[1], 250); near(t3.interno, 1700);
});

test('nafta: lleno y vacio se leen por lo que le queda al tanque', async () => {
  const { tanqueLleno } = await import('../src/core/nafta.js');
  const { TANQUE_EXTRA_KM, TANQUE_LLENO_FRAC } = await import('../src/data/tuning.js');
  assert.ok(tanqueLleno(TANQUE_EXTRA_KM));
  assert.ok(tanqueLleno(TANQUE_EXTRA_KM * TANQUE_LLENO_FRAC));
  assert.ok(!tanqueLleno(TANQUE_EXTRA_KM * TANQUE_LLENO_FRAC - 1));
  assert.ok(!tanqueLleno(0));
});

test('nafta: tres zonas de gasto — MAYOR abajo, MEDIO, MENOR arriba de todo', async () => {
  const { zonaGasto, fAltura } = await import('../src/core/nafta.js');
  const { RADAR_ALT, CH_ALT, FLY_TOP, BANDA_ALT } = await import('../src/data/tuning.js');
  assert.equal(zonaGasto(0).id, 'mayor');
  assert.equal(zonaGasto(BANDA_ALT).id, 'mayor');
  assert.equal(zonaGasto(RADAR_ALT - 0.01).id, 'mayor', 'debajo del radar es la zona cara');
  assert.equal(zonaGasto(RADAR_ALT).id, 'medio');
  assert.equal(zonaGasto(CH_ALT).id, 'menor', 'la cita con la Chancha cae en la zona barata');
  assert.equal(zonaGasto(FLY_TOP).id, 'menor');
  assert.ok(fAltura(0) > fAltura(RADAR_ALT) && fAltura(RADAR_ALT) > fAltura(FLY_TOP));
  assert.equal(fAltura(FLY_TOP), 1, 'el crucero alto es la referencia: un km cuesta un km');
  assert.equal(zonaGasto(-5).id, 'mayor', 'por debajo del agua (roce) sigue siendo la cara');
});

test('nafta: el arrastre baja al soltar, y el avion limpio vuela liviano', async () => {
  const { fCarga, colgadoDe } = await import('../src/core/nafta.js');
  const tres = fCarga(colgadoDe('tres_bombas')), base = fCarga(colgadoDe('tanques_bomba'));
  const una = fCarga(colgadoDe('bomba')), limpio = fCarga(colgadoDe('nada'));
  assert.ok(tres > una && una > limpio);
  assert.ok(limpio < 1, 'sin nada colgando la vuelta sale mas barata que el crucero cargado');
  near(fCarga({ bombas: 1, tanques: 0 }), una, 1e-12);   // la base, soltados los dos tanques
  assert.ok(fCarga({ bombas: 1, tanques: 0 }) < base, 'soltar los tanques baja el arrastre');
});

test('nafta: el turbo cuesta en proporcion a lo que acelera', async () => {
  const { fVelocidad, gastoKm, extraTurboPorSeg } = await import('../src/core/nafta.js');
  near(fVelocidad(1), 1);
  near(fVelocidad(1.5), 2.25);                       // el turbo de siempre: x2.25 por km
  assert.ok(fVelocidad(1.8) > fVelocidad(1.5), 'con el after apilado cuesta mas, porque da mas');
  near(fVelocidad(0.7), 1);                          // frenar no abarata
  const c = { bombas: 1, tanques: 2 };
  near(gastoKm(10, 60, c, 1.5), gastoKm(10, 60, c) * 2.25);
  // por SEGUNDO es r³: r² por km, y r veces mas km por segundo
  near(extraTurboPorSeg(3.2, 1), 0);
  near(extraTurboPorSeg(3.2, 1.5), 3.2 * (3.375 - 1));
  near(extraTurboPorSeg(6.4, 1.5), 2 * extraTurboPorSeg(3.2, 1.5), 1e-9);  // sigue a la fase
});

test('nafta: el bingo es el piso optimista — alto, sin turbo, con lo que cuelga', async () => {
  const { bingoKm, gastoKm } = await import('../src/core/nafta.js');
  const { FLY_TOP } = await import('../src/data/tuning.js');
  const c = { bombas: 0, tanques: 2 };
  near(bingoKm(500, c), gastoKm(500, FLY_TOP, c));
  assert.ok(bingoKm(500, c) < gastoKm(500, 0, c), 'volver al ras cuesta mas que el bingo');
});

test('nafta: el trueque de la carga sale solo de los numeros (PLAN §4)', async () => {
  const { perfilMision } = await import('./nafta_perfil.js');
  // dos tanques + bomba: autonomia — vuelve sola, aun con turbo en la corrida final
  assert.ok(perfilMision('tanques_bomba').vuelve > 0);
  assert.ok(perfilMision('tanques_bomba', { turbo: true }).vuelve > 0);
  // tres bombas: llega, y vuelve JUSTA volando de manual (desde el 8/10 el ras quema x1,5 y no x3:
  // "es IMPOSIBLE la cantidad de gasolina"); con mucho menos margen que la base
  assert.ok(perfilMision('tres_bombas').llega > 0);
  assert.ok(perfilMision('tres_bombas').vuelve < perfilMision('tanques_bomba').vuelve / 3);
  // el turbo se paga
  assert.ok(perfilMision('tanques_bomba', { turbo: true }).llega < perfilMision('tanques_bomba').llega);
  // soltar los tanques con nafta adentro la tira: se llega con menos
  assert.ok(perfilMision('tanques_bomba', { turbo: true, sueltaTanques: true }).llega
    < perfilMision('tanques_bomba', { turbo: true }).llega);
});

// ---------- LA RUTA EN KM REALES (src/core/ruta.js, PLAN_NAFTA_ALCANCE N1) ----------
const RUTA_T = { blancoKm: 700, radarKm: 180, niveladoKm: 120, potenciaKm: 50, chanchaIda: [450, 370], chanchaVuelta: [350, 400] };
const FASES_T = [
  { tipo: 'transito', hasta: 0.2 }, { tipo: 'descenso', hasta: 0.3 }, { tipo: 'rasante', hasta: 0.9 },
  { tipo: 'blanco', hasta: 1 }, { tipo: 'vuelta', hasta: 2 },
];

test('ruta: las anclas caen en los bordes de fase, y entre ellas es lineal', async () => {
  const { anclas, posKm } = await import('../src/core/ruta.js');
  const a = anclas(RUTA_T, FASES_T);
  // la vuelta es ESPEJO de la ida (2/10): cada ancla tiene su gemela del otro lado del blanco
  const r = a.map(x => ({ p: +x.p.toFixed(6), km: x.km }));
  assert.deepEqual(r, [{ p: 0, km: 0 }, { p: 0.2, km: 520 }, { p: 0.3, km: 580 }, { p: 0.9, km: 650 }, { p: 1, km: 700 },
    { p: 1.1, km: 750 }, { p: 1.7, km: 820 }, { p: 1.8, km: 880 }, { p: 2, km: 1400 }]);
  near(posKm(0, a), 0);
  near(posKm(0.1, a), 260);                // la mitad del crucero comprimido
  near(posKm(0.2, a), 520);                // el horizonte de radar: 180 km al blanco
  near(posKm(1, a), 700);
  near(posKm(1.8, a), 880);                // el gemelo del radar: 180 km del blanco, de vuelta
  near(posKm(1.9, a), 1140);               // la mitad del crucero de vuelta, comprimido como el de ida
  near(posKm(9, a), 1400);                 // pasado casa, el odometro no sigue
});

test('ruta: la vuelta es espejo de la ida — despues del blanco se quema lo mismo que antes', async () => {
  const { anclas, kmPorMetro } = await import('../src/core/ruta.js');
  const a = anclas(RUTA_T, FASES_T), obj = 10000;
  // el metro justo despues del buque vale lo mismo que el justo antes (la corrida final, espejada)
  near(kmPorMetro(1.05, a, obj), kmPorMetro(0.95, a, obj), 1e-9);
  // y el crucero de vuelta se comprime igual que el de ida
  near(kmPorMetro(1.9, a, obj), kmPorMetro(0.1, a, obj), 1e-9);
});

test('ruta: el crucero se comprime y el rasante no', async () => {
  const { anclas, kmPorMetro } = await import('../src/core/ruta.js');
  const a = anclas(RUTA_T, FASES_T), obj = 10000;
  const crucero = kmPorMetro(0.1, a, obj), rasante = kmPorMetro(0.5, a, obj);
  assert.ok(crucero > 10 * rasante, `un metro de crucero (${crucero}) tiene que valer mucho mas que uno de rasante (${rasante})`);
  near(crucero * 0.2 * obj, 520, 1e-6);    // el tramo entero suma lo que dice la ruta
  assert.equal(kmPorMetro(3, a, obj), 0, 'pasado casa no se recorre nada');
});

test('ruta: sin descenso no hay ancla de radar, y el tramo se estira entre sus vecinos', async () => {
  const { anclas } = await import('../src/core/ruta.js');
  const a = anclas(RUTA_T, [{ tipo: 'rasante', hasta: 1 }]);
  assert.deepEqual(a.map(x => x.km), [0, 700]);
});

test('ruta: el validador ataja lo que haria km inventados', async () => {
  const { validarRuta } = await import('../src/core/ruta.js');
  assert.deepEqual(validarRuta(undefined, FASES_T), [], 'una mision sin ruta es valida');
  assert.deepEqual(validarRuta(RUTA_T, FASES_T), []);
  assert.ok(validarRuta({ ...RUTA_T, blancoKn: 3 }, FASES_T).length, 'clave desconocida');
  assert.ok(validarRuta({ radarKm: 180 }, FASES_T).length, 'sin blancoKm no hay ruta');
  assert.ok(validarRuta({ ...RUTA_T, niveladoKm: 200 }, FASES_T).length, 'nivelado antes que el radar');
  assert.ok(validarRuta({ ...RUTA_T, chanchaIda: [450, 150] }, FASES_T).length, 'la Chancha adentro del radar');
  assert.ok(validarRuta({ ...RUTA_T, chanchaIda: [800, 400] }, FASES_T).length, 'la Chancha detras de la base');
  assert.ok(validarRuta({ ...RUTA_T, chanchaIda: 400 }, FASES_T).length, 'la zona es [km, km]');
  assert.ok(validarRuta(RUTA_T, undefined).length, 'sin fases no hay a que anclarse');
  assert.ok(validarRuta(RUTA_T, [{ tipo: 'rasante', hasta: 1 }]).length, 'chanchaVuelta sin vuelta');
  // un descenso DESPUES del rasante: la fraccion avanza y los km retroceden
  assert.ok(validarRuta({ blancoKm: 700, radarKm: 180, niveladoKm: 120 },
    [{ tipo: 'transito', hasta: 0.2 }, { tipo: 'rasante', hasta: 0.5 }, { tipo: 'descenso', hasta: 0.7 }, { tipo: 'blanco', hasta: 1 }]).length);
});

test('ruta: toda mision que la declara la tiene sana (campaña y banco de pruebas)', async () => {
  const { validarRuta } = await import('../src/core/ruta.js');
  const { MISIONES_PRUEBA: MP } = await import('../src/data/pruebas_misiones.js');
  for (const m of [...MISSIONS, ...MP]) {
    const e = validarRuta(m.ruta, m.fases);
    assert.deepEqual(e, [], `${m.id}: ${e.join(' · ')}`);
  }
  assert.ok(MP.find(m => m.id === 't15').ruta, 't15 es el banco de la ruta');
});

// ---------- EL RADAR CON ALCANCE (src/core/ruta.js, PLAN_NAFTA_ALCANCE N2) ----------
test('radar: la linea de alcance cae donde la ruta dice, en la ida y en la vuelta', async () => {
  const { anclas, lineasRadar, fraccionDeKm, posKm } = await import('../src/core/ruta.js');
  const a = anclas(RUTA_T, FASES_T);
  const l = lineasRadar(RUTA_T, a);
  near(l.entra, 0.2);                        // el descenso: 180 km al blanco
  near(posKm(l.sale, a), 700 + 180);         // la vuelta: 180 km pasado el blanco
  for (const km of [100, 520, 650, 1000]) near(posKm(fraccionDeKm(km, a), a), km, 1e-9);
  assert.equal(fraccionDeKm(5000, a), null, 'mas alla de casa no hay fraccion');
  // sin vuelta, el radar sigue hasta el final
  const sinV = [{ tipo: 'descenso', hasta: 0.5 }, { tipo: 'blanco', hasta: 1 }];
  assert.equal(lineasRadar({ blancoKm: 700, radarKm: 180 }, anclas({ blancoKm: 700, radarKm: 180 }, sinV)).sale, null);
  // sin radarKm, el radar existe desde la base como siempre
  assert.deepEqual(lineasRadar({ blancoKm: 700 }, anclas({ blancoKm: 700 }, FASES_T)), { entra: 0, sale: null });
});

test('radar: fuera de alcance no hay techo; entrando baja con rampa; saliendo sube de una', async () => {
  const { techoAlcance } = await import('../src/core/ruta.js');
  const L = { entra: 0.2, sale: 1.25 }, OBJ = 10000, ARRIBA = 68, RAMPA = 900;
  const t = d => techoAlcance(20, d, OBJ, L, ARRIBA, RAMPA);
  assert.equal(t(0), ARRIBA, 'el despegue esta fuera de radar');
  assert.equal(t(1999), ARRIBA);
  assert.equal(t(2000), ARRIBA, 'en la linea misma todavia no muerde');
  near(t(2450), 44);                          // a mitad de la rampa
  assert.equal(t(2900), 20);
  assert.equal(t(9000), 20, 'adentro rige el techo de la fase');
  assert.equal(t(12499), 20);
  assert.equal(t(12500), ARRIBA, 'saliendo en la vuelta, el cielo vuelve de una');
  // el techo de un filo adentro del alcance se respeta
  assert.equal(techoAlcance(9, 5000, OBJ, L, ARRIBA, RAMPA), 9);
});

// EL VIENTO EN CONTRA, POR TRAMO (pedido del autor 23/9): ya no sopla en todo el cielo
test('viento: tramos y fases lo declaran con un booleano, y sin la clave no sopla', async () => {
  const { tramoAt } = await import('../src/core/tramos.js');
  assert.deepEqual(validarTramos([{ hasta: 1, viento: true }]), []);
  assert.ok(validarTramos([{ hasta: 1, viento: 'si' }]).length, 'viento es booleano');
  assert.deepEqual(validarFases([{ tipo: 'transito', hasta: 1, viento: true }]), []);
  assert.ok(validarFases([{ tipo: 'transito', hasta: 1, viento: 1 }]).length, 'viento es booleano');
  assert.equal(tramoAt(10, 100, [{ hasta: 1 }]).val('viento', false), false, 'sin la clave no sopla');
  assert.equal(tramoAt(10, 100, [{ hasta: 1, viento: true }]).val('viento', false), true);
  const { TIPOS } = await import('../src/data/fases.js');
  for (const t of Object.keys(TIPOS)) assert.equal(TIPOS[t].viento, undefined, `el tipo ${t} no puede traer viento de fabrica`);
});

// ---------- EL TANQUE DE LA CORRIDA (systems/nafta.js, PLAN_NAFTA_ALCANCE N3) ----------
test('nafta: cargar llena primero el interno, despues los externos colgados, y no se estira', async () => {
  const { cargar, kmQuedan } = await import('../src/core/nafta.js');
  const t = cargar({ tanques: [100, 100], interno: 1500 }, 300);
  assert.equal(t.interno, 1700);
  near(t.tanques[0], 150); near(t.tanques[1], 150);
  const lleno = cargar({ tanques: [440, 440], interno: 1700 }, 9999);
  assert.equal(kmQuedan(lleno), 2600, 'lo que no entra se pierde');
  assert.equal(cargar({ tanques: [], interno: 1000 }, 900).interno, 1700, 'sin externos, tope en el interno');
});

test('nafta: el % que otro sistema toca se traslada al tanque, y seco avisa', async () => {
  const nafta = await import('../src/systems/nafta.js');
  const { run } = await import('../src/core/run.js');
  nafta.preparar('tanques_bomba');
  assert.equal(run.naftaCap, 2600); assert.equal(run.fuel, 100);
  // la Chancha (o quien sea) no puede cargar arriba de lleno; una pirueta descuenta 10%
  run.fuel -= 10;
  nafta.step(0, 60, { bombas: 1, tanques: 2 }, 1);
  near(nafta.kmRestan(), 2340, 1e-6);
  near(run.fuel, 90, 1e-9);
  // 100 km en la zona menor con dos tanques y una bomba cuestan 100 × 1 × 1.15
  nafta.step(100, 60, { bombas: 1, tanques: 2 }, 1);
  near(nafta.kmRestan(), 2340 - 115, 1e-6);
  // la carga externa entra al tanque
  run.fuel += 5;
  nafta.step(0, 60, { bombas: 1, tanques: 2 }, 1);
  near(nafta.kmRestan(), 2225 + 130, 1e-6);
  assert.equal(nafta.step(1e6, 0, { bombas: 1, tanques: 2 }, 1), 'seco');
  assert.equal(run.fuel, 0);
  nafta.preparar(null);
  assert.equal(nafta.activo(), false, 'sin ruta el tanque se apaga');
});

// ---------- LA CHANCHA EN DOS MITADES (PLAN_NAFTA_ALCANCE N4) ----------
test('chancha: las zonas de la ruta caen donde dicen los km, en la ida y en la vuelta', async () => {
  const { anclas, zonasChancha, posKm } = await import('../src/core/ruta.js');
  const a = anclas(RUTA_T, FASES_T), z = zonasChancha(RUTA_T, a);
  near(posKm(z.ida[0], a), 700 - 450); near(posKm(z.ida[1], a), 700 - 370);
  near(posKm(z.vuelta[0], a), 700 + 350); near(posKm(z.vuelta[1], a), 700 + 400);
  assert.equal(zonasChancha({ blancoKm: 700 }, a).ida, null, 'sin zona declarada no hay zona');
});

test('chancha: con ruta se la llama por tramo, hasta lo que diga la mision, y siempre con barra', async () => {
  const ch = await import('../src/systems/chancha.js');
  const g = m => ({ fuelOn: true, enPasillo: true, viva: true, t: 0, minT: 0, mitad: m.mitad, max: m.max });
  ch.resetChancha();
  assert.equal(ch.pedir(g({ mitad: 'ida', max: 1 })), 'empty', 'sin barra no viene: nunca sola');
  ch.cargar();
  assert.equal(ch.pedir(g({ mitad: 'ida', max: 1 })), 'ok');
  ch.tick(10, { inPlay: false });               // se fue
  ch.cargar();
  assert.equal(ch.pedir(g({ mitad: 'ida', max: 1 })), 'used', 'la ida permite una');
  assert.equal(ch.pedir(g({ mitad: 'vuelta', max: 2 })), 'ok', 'la vuelta tiene las suyas');
  ch.tick(10, { inPlay: false }); ch.cargar();
  assert.equal(ch.pedir(g({ mitad: 'vuelta', max: 2 })), 'ok', 'y en la vuelta, dos');
  ch.tick(10, { inPlay: false }); ch.cargar();
  assert.equal(ch.pedir(g({ mitad: 'vuelta', max: 2 })), 'used');
  assert.equal(ch.pedir(g({ mitad: 'vuelta', max: 0 })), 'used', 'una mision puede no permitir ninguna');
  ch.resetChancha();
  // LA DE LA IDA ESTABA PLANIFICADA: viene sin barra, y la barra que tengas queda para la vuelta
  assert.equal(ch.pedir({ ...g({ mitad: 'ida', max: 1 }), sinBarra: true }), 'ok', 'la de la ida no pide barra');
  ch.tick(10, { inPlay: false }); ch.cargar();
  assert.equal(ch.pedir({ ...g({ mitad: 'ida', max: 1 }), sinBarra: true }), 'used');
  assert.equal(ch.meterVal(), 1, 'y no se lleva la barra ganada');
  ch.resetChancha();
  // sin mitad, el poder clasico de siempre: una vez por corrida
  ch.cargar();
  assert.equal(ch.pedir({ fuelOn: true, enPasillo: true, viva: true, t: 999 }), 'ok');
  ch.tick(10, { inPlay: false }); ch.cargar();
  assert.equal(ch.pedir({ fuelOn: true, enPasillo: true, viva: true, t: 999 }), 'used');
  ch.resetChancha();
});

test('chancha: hay que SOSTENERSE en la caja antes de cargar, y su reserva baja mientras da', async () => {
  const ch = await import('../src/systems/chancha.js');
  const { CH_ENGANCHE, CH_ETA, CH_BAJADA_T } = await import('../src/data/tuning.js');
  ch.resetChancha(); ch.cargar();
  ch.pedir({ fuelOn: true, enPasillo: true, viva: true, t: 0, minT: 0, mitad: 'ida', max: 1 });
  const e = s => ({ inPlay: true, score: 0, planeX: s.bx, planeY: s.by, fuel: 10 });
  const lejos = { inPlay: true, score: 0, planeX: 99, planeY: 0, fuel: 10 };
  ch.tick(CH_ETA + 0.01, lejos);   // llega…
  ch.tick(CH_BAJADA_T + 0.01, lejos);   // …y baja de arriba hasta su altura (la canasta se mueve mientras)
  let s = ch.snapshot(); assert.equal(s.fase, 'cita');
  let o = ch.tick(0.1, e(s)); s = ch.snapshot();
  assert.equal(s.conn, true); assert.equal(s.cargando, false, 'recien entra: naranja');
  assert.equal(o.carga, 0, 'enganchando no pasa nafta');
  o = ch.tick(CH_ENGANCHE, e(s)); s = ch.snapshot();
  assert.equal(s.cargando, true, 'sostenido: verde');
  o = ch.tick(0.5, e(s)); s = ch.snapshot();
  assert.ok(o.carga > 0, 'y ahora si pasa nafta');
  assert.ok(s.reserva < 1, 'y su reserva baja');
  ch.tick(0.1, { inPlay: true, score: 0, planeX: s.bx + 99, planeY: s.by, fuel: 10 }); s = ch.snapshot();
  assert.equal(s.cargando, false, 'salirse corta el enganche');
  ch.resetChancha();
});

// ---------- SOLTAR LOS TANQUES (PLAN_NAFTA_ALCANCE N5) ----------
test('tanques: cada externo sabe su pilon, y se sueltan el par de ala primero y el centro despues', async () => {
  const { tanqueInicial, soltar, proximoPilon, capacidadDe, kmQuedan } = await import('../src/core/nafta.js');
  const t = tanqueInicial('tres_tanques');
  assert.deepEqual(t.pilones, ['ala', 'ala', 'centro']);
  assert.equal(proximoPilon(t), 'ala');
  const a = soltar(t, 'ala');
  assert.deepEqual(a.soltados, [450, 450], 'se van con lo que tenian adentro');
  assert.deepEqual(a.tanque.pilones, ['centro']);
  assert.equal(capacidadDe(a.tanque), 1700 + 450, 'la capacidad baja con ellos');
  assert.equal(proximoPilon(a.tanque), 'centro');
  const b = soltar(a.tanque, 'centro');
  assert.equal(proximoPilon(b.tanque), null);
  assert.equal(kmQuedan(b.tanque), 1700);
  assert.deepEqual(soltar(b.tanque, 'ala').soltados, [], 'no se suelta lo que no cuelga');
  assert.deepEqual(tanqueInicial('tres_bombas').pilones, [], 'tres bombas no tiene tanques');
  assert.deepEqual(tanqueInicial('bombas_tanque').pilones, ['centro']);
});

test('tanques: soltarlos en la corrida baja la capacidad, conserva lo de adentro y acelera', async () => {
  const nafta = await import('../src/systems/nafta.js');
  const { run } = await import('../src/core/run.js');
  nafta.preparar('tanques_bomba');
  nafta.step(1000, 60, { bombas: 1, tanques: 2 }, 1);           // 1150 km: vacia los externos y 250 del interno
  const quedaban = nafta.kmRestan();
  const r = nafta.soltarTanques();
  assert.equal(r.pilon, 'ala');
  near(r.soltados[0] + r.soltados[1], 0, 1e-6, 'vacios: no se tiro nada');
  near(nafta.kmRestan(), quedaban, 1e-6);
  assert.equal(run.naftaCap, 1700);
  near(run.fuel, quedaban / 1700 * 100, 1e-9);
  assert.equal(nafta.soltarTanques(), null, 'no queda nada que soltar');
  assert.equal(nafta.velCarga({ bombas: 1, tanques: 2 }), 1, 'la carga base es la referencia');
  assert.ok(nafta.velCarga({ bombas: 1, tanques: 0 }) > 1, 'sin tanques va mas rapido');
  assert.ok(nafta.velCarga({ bombas: 0, tanques: 0 }) > nafta.velCarga({ bombas: 1, tanques: 0 }), 'limpio, mas');
  nafta.preparar(null);
  assert.equal(nafta.velCarga({ bombas: 0, tanques: 0 }), 1, 'sin carga la velocidad no cambia');
});

test('peso sin ruta: el tanque existe, el % pasa a los externos primero y soltar no regala nafta (30/9)', async () => {
  const nafta = await import('../src/systems/nafta.js');
  const { run } = await import('../src/core/run.js');
  nafta.preparar('tanques_bomba', false);
  assert.equal(nafta.activo(), false, 'sin ruta no hay cuenta en km (ni su HUD)');
  assert.equal(nafta.hayTanque(), true, 'pero los pilones estan');
  run.fuel -= 20; nafta.sincronizar();                   // el gasto por segundo de siempre
  near(run.fuel, 80, 1e-9, 'el % no cambia por pasar al tanque');
  assert.ok(run.tanque.interno === 1700 && run.tanque.tanques[0] < 450, 'se quemo de los externos');
  const antes = nafta.velCarga(nafta.colgadoAhora(1)); run.fuel -= 20; nafta.sincronizar();
  assert.ok(nafta.velCarga(nafta.colgadoAhora(1)) > antes, 'quemarlos aliviana');
  const km = nafta.kmRestan(); nafta.soltarTanques();
  assert.ok(nafta.escalaGasto() > 1, 'con menos capacidad, cada % vale menos km: se gasta mas % por segundo');
  assert.ok(nafta.kmRestan() <= km && nafta.kmRestan() === run.tanque.interno, 'lo de los externos se fue con ellos');
  nafta.preparar(null);
});

// ---------- EL HANGAR (PLAN_NAFTA_ALCANCE N7) ----------
test('hangar: las cargas elegibles existen, llevan la bomba del buque y tienen sus textos', async () => {
  const { CARGAS_ELEGIBLES, CARGA_ELEGIBLE_DESDE, CARGA_BASE, cargaDe, CARGAS } = await import('../src/data/cargas.js');
  const { STRINGS } = await import('../src/data/strings.js');
  assert.deepEqual(CARGAS_ELEGIBLES, ['tanques_bomba', 'tres_bombas', 'bomba'], 'las tres del autor');
  assert.equal(CARGAS_ELEGIBLES[0], CARGA_BASE, 'la base primero: es donde arranca el cursor');
  assert.equal(CARGA_ELEGIBLE_DESDE, 2, 'desde M3');
  for (const id of CARGAS_ELEGIBLES) {
    assert.ok(CARGAS.some(c => c.id === id), id + ' no existe');
    assert.equal(cargaDe(id).centro, 'bomba', id + ': la del buque nunca falta');
    for (const l of ['es', 'en']) assert.ok(STRINGS[l]['cargaDesc_' + id], `${l}: falta cargaDesc_${id}`);
  }
  for (const k of ['cargaTitle', 'cargaSub', 'cargaKm', 'cargaBomba1', 'cargaBombas', 'cargaVel', 'cargaSinChancha'])
    for (const l of ['es', 'en']) assert.ok(STRINGS[l][k], `${l}: falta ${k}`);
});

test('hangar: la velocidad relativa es 1 en la base, y mas rapida con menos colgado', async () => {
  const { velRelativa, colgadoDe } = await import('../src/core/nafta.js');
  near(velRelativa(colgadoDe('tanques_bomba')), 1);
  // mismo arrastre (tres piezas) pero tres bombas pesan menos que dos tanques llenos y una bomba
  assert.ok(velRelativa(colgadoDe('tres_bombas')) > 1 && velRelativa(colgadoDe('tres_bombas')) < 1.08);
  assert.ok(velRelativa(colgadoDe('bomba')) > velRelativa(colgadoDe('tres_bombas')));
  assert.ok(velRelativa(colgadoDe('bomba')) > 1.1);
});

test('peso: la nafta de los tanques, las bombas y soltar cambian la velocidad (pedido 30/9)', async () => {
  const { velRelativa, masaDe } = await import('../src/core/nafta.js');
  const { TANQUE_EXTRA_KM, PESO_BOMBA_KG } = await import('../src/data/tuning.js');
  const llenos = { bombas: 1, tanques: 2, nafta: 2 * TANQUE_EXTRA_KM };
  const secos = { ...llenos, nafta: 0 };
  near(velRelativa(llenos), 1, 1e-12, 'la base llena es la referencia');
  assert.ok(velRelativa(secos) > 1.04, 'quemar la nafta de los externos aliviana');
  assert.ok(masaDe(llenos) - masaDe(secos) > 1500, 'dos tanques llenos pesan como tres bombas');
  // soltar: el tanque se va entero, lleno o vacio llegas al mismo avion (lo lleno se perdio al mar)
  const sinTanques = { bombas: 1, tanques: 0, nafta: 0 };
  assert.ok(velRelativa(sinTanques) / velRelativa(llenos) > velRelativa(sinTanques) / velRelativa(secos), 'soltar lleno acelera mas');
  assert.ok(velRelativa(sinTanques) > velRelativa(secos), 'soltar los vacios igual acelera: el arrastre y la chapa');
  // la bomba: tirarla acelera, y la BRP (250 kg) pesa la mitad que la MK-17
  assert.ok(velRelativa({ bombas: 0, tanques: 0, nafta: 0 }) > velRelativa(sinTanques), 'sin la bomba, mas');
  assert.ok(velRelativa({ ...sinTanques, bombaKg: 250 }) > velRelativa({ ...sinTanques, bombaKg: PESO_BOMBA_KG }), 'BRP mas liviana');
  // el techo: limpio del todo no pasa de +25% (es juego, no un cohete)
  assert.ok(velRelativa({ bombas: 0, tanques: 0, nafta: 0 }) < 1.25);
});

// ---------- LOS TANQUES COMO ARMA (PLAN_NAFTA_ALCANCE N6) ----------
test('tanques-arma: lleno mata y enciende lo explosivo; vacio voltea lo que vuela y toca lo demas', async () => {
  const { golpeTanque, buqueTanque, estadoTanque } = await import('../src/core/nafta.js');
  const { ENEMY_HP, TANQUE_EXTRA_KM } = await import('../src/data/tuning.js');
  // lleno: letal contra todo, y explota contra lo explosivo
  for (const t of ['jet', 'helo', 'aa', 'depot', 'bldg']) assert.equal(golpeTanque('lleno', t, ENEMY_HP[t]).mata, true, 'lleno contra ' + t);
  assert.equal(golpeTanque('lleno', 'depot', 3).explota, true);
  assert.equal(golpeTanque('lleno', 'jet', 3).explota, false, 'un avion no es un deposito');
  // vacio: un avion o un helicoptero con uno solo…
  assert.equal(golpeTanque('vacio', 'jet', ENEMY_HP.jet).mata, true);
  assert.equal(golpeTanque('vacio', 'helo', ENEMY_HP.helo).mata, true);
  // …a lo demas, daño medio, y nunca enciende nada
  const aa = golpeTanque('vacio', 'aa', ENEMY_HP.aa);
  assert.equal(aa.mata, false); assert.ok(aa.dano > 0 && aa.dano < ENEMY_HP.aa);
  assert.equal(golpeTanque('vacio', 'depot', 3).explota, false);
  // el buque: lleno = una bomba, vacio = media → el PAR vacio vale lo que un lleno
  assert.equal(buqueTanque('lleno'), 1);
  assert.equal(buqueTanque('vacio') * 2, buqueTanque('lleno'));
  assert.equal(estadoTanque(TANQUE_EXTRA_KM), 'lleno');
  assert.equal(estadoTanque(0), 'vacio');
});

// ---------- LA CALIBRACION (PLAN_NAFTA_ALCANCE N8): t15 volada a la velocidad del juego ----------
// La vara: si alguien mueve un numero de la nafta, de la ruta o de la Chancha y el trueque de la
// carga se rompe en la mision de verdad, esto lo dice. Los numeros exactos los imprime `npm run feel`.
test('calibracion: en t15 el trueque de la carga se sostiene a la velocidad del juego', async () => {
  const { vueloRuta } = await import('./nafta_perfil.js');
  const { MISIONES_PRUEBA: MP } = await import('../src/data/pruebas_misiones.js');
  const t15 = MP.find(m => m.id === 't15');
  // dos tanques + bomba: vuelve sola, aun con turbo en la corrida final
  assert.equal(vueloRuta(t15, 'tanques_bomba').seco, null);
  assert.equal(vueloRuta(t15, 'tanques_bomba', { turboFinal: true }).seco, null);
  // tres bombas: sola se seca; sin la de la ida no llega viva a la zona de la vuelta; con la de la
  // ida vuelve, pero justa
  // (8/10: con el ras a x1,5 tres bombas ya no se seca sola volando el perfil; vuelve con menos que
  // la base, que es el trueque que queda)
  assert.ok(vueloRuta(t15, 'tres_bombas').casa < vueloRuta(t15, 'tanques_bomba').casa, 'tres bombas vuelve con menos');
  const ida = vueloRuta(t15, 'tres_bombas', { chIda: true });
  assert.equal(ida.seco, null, 'con la de la ida, tres bombas vuelve');
  assert.ok(ida.casa < vueloRuta(t15, 'tanques_bomba', { chIda: true }).casa, 'pero con menos que la base');
  // una bomba: sola no vuelve; con cualquiera de las dos Chanchas, si
  // (8/10: con el ras a x1,5 una bomba sola tambien vuelve volando el perfil, pero con menos que la base)
  assert.ok(vueloRuta(t15, 'bomba').casa < vueloRuta(t15, 'tanques_bomba').casa, 'una bomba vuelve con menos');
  assert.equal(vueloRuta(t15, 'bomba', { chIda: true }).seco, null);
  assert.equal(vueloRuta(t15, 'bomba', { chVuelta: true }).seco, null);
  // la zona de la Chancha de la ida dura segundos, no un instante
  assert.ok(vueloRuta(t15, 'tanques_bomba').enZona.ida >= 3, 'la zona de la ida se cruza demasiado rapido');
});

// LA VUELTA REAL V0 (docs/sistemas/PLAN_VUELTA_REAL.md): el escape se apoya en dos piezas chicas —
// una fase puesta a mano que tapa a las de la data, y las estrellas con un reloj propio.
test('vuelta real: la fase del escape tapa a la vuelta y no se anuncia', async () => {
  const fases = await import('../src/systems/fases.js');
  const lista = [{ tipo: 'rasante', hasta: 1, radio: 'r1' }, { tipo: 'vuelta', hasta: 2, radio: 'r2', obstacles: 3 }];
  fases.setFases(lista, 1000);
  run.dist = 1200;                                         // ya en la vuelta
  assert.equal(fases.val('radio', null), 'r2');
  fases.stepFases();                                       // adopta la vigente
  fases.tapar({ tipo: 'vuelta', radio: null });
  assert.equal(fases.tapada(), true);
  assert.equal(fases.val('radio', 'x'), null, 'la tapa manda: sin radio');
  assert.equal(fases.val('obstacles', 7), 7, 'lo que la tapa no dice cae al fallback, no a la fase de abajo');
  assert.equal(fases.stepFases(), null, 'la tapa no se anuncia');
  fases.tapar(null);
  assert.equal(fases.val('radio', null), 'r2');
  fases.setFases(null, 0); run.dist = 0;
});

test('vuelta real: las estrellas se llenan de golpe y bajan con el reloj que se pida', async () => {
  const est = await import('../src/systems/estrellas.js');
  const { EST_MAX, EST_PERDER_S } = await import('../src/data/tuning.js');
  est.resetEstrellas();
  est.llenar(EST_MAX);
  assert.equal(run.estrellas, EST_MAX);
  let bajo = null;
  for (let t = 0; t < 9.05 && !bajo; t += 0.05) bajo = est.step(0.05, true, 9);
  assert.ok(bajo, 'con 9 s por estrella, a los 9 s baja una');
  assert.equal(run.estrellas, EST_MAX - 1);
  est.resetEstrellas();
  est.llenar(1);
  bajo = null;
  for (let t = 0; t < 9.05 && !bajo; t += 0.05) bajo = est.step(0.05, true);
  assert.equal(bajo, null, 'sin reloj propio manda el general (' + EST_PERDER_S + ' s)');
  est.resetEstrellas();
});

// LA LINEA RECTA (PLAN_VUELTA_REAL V2): la trazadora de popa viene casi paralela al vuelo y cae al
// agua adelante; con el origen cerca se iba al cielo, que es lo que esta regla cuida.
test('vuelta real: la trazadora de popa pasa por la mira y pica adelante', async () => {
  const { tiroEn } = await import('../src/core/escape.js');
  const { ESC } = await import('../src/data/blanco.js');
  const tr = { ox: 0, oy: 2.5, ax: 1, ay: 5 };
  const enAvion = tiroEn(tr, 14, ESC.DIST, 14, ESC.G);
  assert.deepEqual([enAvion.x, enAvion.y], [1, 5], 'a la profundidad del avion pasa por la mira');
  const lejos = tiroEn(tr, 250, ESC.DIST, 14, ESC.G);
  assert.ok(lejos.y < 1, 'pasado el avion cae al agua antes de Z_MAX (y=' + lejos.y.toFixed(2) + ')');
  assert.ok(Math.abs(lejos.x - 1) < 2, 'y no se abre de costado');
});

// "LA TRAJO A UPA" (PLAN_VUELTA_REAL V5): con el tanque perforado, llenarlo no termina la cita.
test('vuelta real: con fuga la Chancha no se va al llenar — te lleva a upa', async () => {
  const ch = await import('../src/systems/chancha.js');
  const { CH_ALT, CH_HOSE_X, CH_HOSE_Y, CH_ENGANCHE } = await import('../src/data/tuning.js');
  const vuelo = fuga => {
    ch.resetChancha();
    assert.equal(ch.pedir({ fuelOn: true, enPasillo: true, viva: true, t: 999, minT: 0, mitad: 'vuelta', max: 1, eta: 0.1, sinBarra: true }), 'ok');
    const sigs = [];
    const e = { inPlay: true, score: 0, planeX: CH_HOSE_X, planeY: CH_ALT - CH_HOSE_Y, fuel: 90, golpe: false, fuga };
    for (let i = 0; i < 600; i++) {
      const o = ch.tick(0.05, e);
      if (o.sig) sigs.push(o.sig);
      e.fuel = Math.min(100, e.fuel + o.carga);
      if (i > 20 + CH_ENGANCHE * 20 && ch.activa() === false) break;
    }
    return sigs;
  };
  const sinFuga = vuelo(false), conFuga = vuelo(true);
  assert.ok(sinFuga.includes('lleno'), 'sin fuga: llena y se va (' + sinFuga + ')');
  assert.ok(!conFuga.includes('lleno') && conFuga.includes('upa'), 'con fuga: avisa que te lleva y no se va al llenar (' + conFuga + ')');
  ch.resetChancha();
});

// ---------- LA FILA Y EL CAMBIO DE PILOTO (core/squad.js, 26/9/2026) ----------
// LA GARANTIA DE FONDO: con la mecanica APAGADA la fila nunca se reordena, y entonces tiene que dar
// EXACTAMENTE los mismos pilotos que la cuenta de vidas de siempre. Diecisiete lugares del juego
// dejaron de preguntarle a `pilotIdx` y le preguntan a la fila; si esto se rompe, se rompen todos.
test('fila: apagada, da los mismos pilotos que la cuenta de vidas', () => {
  for (let squad = 1; squad <= 8; squad++) {
    for (let lives = 1; lives <= squad; lives++) {
      const r = { squad, lives, orden: filaDeVidas(squad, lives) };
      assert.equal(alMando(r), pilotIdx(squad, lives), `manda, ${lives}/${squad}`);
      if (lives > 1) assert.equal(detras(r), pilotIdx(squad, lives) + 1, `el de atras, ${lives}/${squad}`);
    }
  }
});

test('fila: caer es sacar al primero, y da lo mismo que descontar una vida', () => {
  const r = { squad: 4, lives: 4, orden: filaDeVidas(4, 4) };
  r.orden.shift(); r.lives--;
  assert.equal(alMando(r), pilotIdx(4, 3));
});

test('fila: cambiar manda al que vuela al fondo y sube el siguiente', () => {
  const r = { squad: 4, lives: 4, orden: [0, 1, 2, 3] };
  r.orden.push(r.orden.shift());
  assert.equal(alMando(r), 1);
  assert.deepEqual(r.orden, [1, 2, 3, 0]);
  // …y dando la vuelta completa vuelve el primero
  for (let i = 0; i < 3; i++) r.orden.push(r.orden.shift());
  assert.equal(alMando(r), 0);
});

test('fila: desincronizada (una sonda toco las vidas), cae a la cuenta de siempre', () => {
  const r = { squad: 4, lives: 2, orden: [0, 1, 2, 3] };
  assert.equal(filaOk(r), false);
  assert.equal(alMando(r), pilotIdx(4, 2));
});


// ---------- POR QUE PERDISTE (data/derrotas.js) ----------
test('derrotas: la bomba errada se explica por su veredicto, y toda clave existe en los dos idiomas', async () => {
  const { derrota, DERROTAS } = await import('../src/data/derrotas.js');
  const { STRINGS } = await import('../src/data/strings.js');
  assert.equal(derrota('death_fallo_blanco', 'dormida').que, 'que_bomba_dormida');
  assert.equal(derrota('death_fallo_blanco', 'dormida').hist, 'hist_bomba_dormida');
  assert.equal(derrota('death_suelta', 'corta').que, 'que_bomba_corta');
  assert.equal(derrota('death_fallo_blanco', '').que, 'que_bomba_nada');
  assert.deepEqual(derrota('death_inventada'), { que: null, hist: null });
  const claves = new Set();
  for (const d of Object.values(DERROTAS)) { if (d.que) claves.add(d.que); if (d.hist) claves.add(d.hist); }
  for (const v of ['dormida', 'corta', 'larga', 'costado', 'averiado', 'nada']) claves.add('que_bomba_' + v);
  for (const k of claves) for (const l of ['es', 'en']) assert.ok(STRINGS[l][k], `falta ${k} en ${l}`);
});

// ---------- EL NOMBRE DE LA POSCOMBUSTION (pedido del autor, 30/9/2026) ----------
test('poscombustion: el jugador no lee "turbo" en ningun idioma', async () => {
  // La mecanica se llama POSCOMBUSTION en castellano y AFTERBURNER en ingles. "Turbo" quedo como
  // nombre INTERNO (run.boost, ESTELA_TURBO, SPD_TURBO...) y esta bien que siga: renombrarlo es un
  // diff mecanico enorme sin efecto para el jugador. Lo que no puede volver es a la PANTALLA.
  //
  // POR QUE UNA PRUEBA Y NO UN RECORDATORIO: el nombre viejo esta en cincuenta lugares del codigo,
  // asi que escribir 'turbo' en un texto nuevo es la equivocacion mas facil del repo. Esta prueba
  // es la unica forma de que no vuelva de contrabando.
  const { STRINGS } = await import('../src/data/strings.js');
  const culpables = [];
  for (const lang of ['es', 'en']) {
    for (const [k, v] of Object.entries(STRINGS[lang])) {
      if (typeof v !== 'string') continue;
      // 'turborreactor' es otra cosa (el motor del Skyhawk) y puede aparecer: se excluye sola.
      const limpio = v.replace(/turborreactor/gi, '');
      // en ingles TAMBIEN se vigila "boost": el renombre dejo tres textos a medias la primera vez
      // (el pie de la pagina, el consejo y el cartel de averia) y ninguna prueba los vio.
      const viejo = lang === 'en' ? /\bturbos?\b|\bboost(s|ing|ed)?\b/i : /\bturbos?\b/i;
      if (viejo.test(limpio)) culpables.push(`${lang}.${k}: ${v.slice(0, 70)}`);
    }
  }
  assert.deepEqual(culpables, [], 'quedo "turbo" a la vista del jugador:\n  ' + culpables.join('\n  '));
});

// ---------------------------------------------------------------------------------------------
// LA GEOGRAFIA DEL PASILLO (docs/sistemas/PLAN_GEOGRAFIA.md, G0)
// ---------------------------------------------------------------------------------------------
import { validarGeografia, setGeografia, geo, sueloEn, esTierraEn, alturaSuelo, escalaRelieve,
  orillaS, ladoEn, playaCerca, playaClase, CLAVES as GEO_CLAVES } from '../src/core/geografia.js';
import { GEOGRAFIAS } from '../src/data/geografias.js';
import { cfg as cfgGeo } from '../src/core/state.js';
import { run as runGeo } from '../src/core/run.js';
import { shoreAt as shoreAtGeo, GEO_PLAYA as GEO_PLAYA_U } from '../src/data/tuning.js';
import { tierraH as tierraHGeo, hayRelieve as hayRelieveGeo } from '../src/core/tierra.js';

test('geografia · LA REGLA SUPREMA: sin dato, todo contesta lo mismo que cfg.terrain', () => {
  // Es la unica prueba que de verdad protege al juego de hoy: cada lector que paso de preguntar
  // `cfg.terrain` a preguntar aca tiene que recibir EXACTAMENTE lo que recibia. Se recorre el
  // camino en los tres mapas, en el eje y a los costados (la costa depende de la x).
  const terr0 = cfgGeo.terrain;
  setGeografia(null, 3000);
  try {
    for (const t of ['sea', 'coast', 'land']) {
      cfgGeo.terrain = t;
      for (let i = 0; i < 200; i++) {
        const wz = i * 37.3, x = ((i * 7) % 60) - 30;
        assert.equal(sueloEn(wz), t, `${t} a ${wz} m`);
        assert.equal(esTierraEn(x, wz), t === 'land' || (t === 'coast' && x < shoreAtGeo(wz)), `${t} tierra en ${x},${wz}`);
        assert.equal(alturaSuelo(x, wz), hayRelieveGeo(cfgGeo) ? tierraHGeo(x, wz) : 0, `${t} altura en ${x},${wz}`);
        assert.equal(orillaS(wz), shoreAtGeo(wz));
        assert.equal(ladoEn(wz), 1);
        assert.equal(playaCerca(wz), null);
      }
    }
  } finally { cfgGeo.terrain = terr0; }
});

test('geografia · el validador acepta lo que funciona y rechaza lo que no existe todavia', () => {
  assert.deepEqual(validarGeografia(undefined), [], 'una mision sin geografia es valida');
  for (const [n, g] of Object.entries(GEOGRAFIAS)) assert.deepEqual(validarGeografia(g), [], `la geografia '${n}'`);
  assert.equal(validarGeografia([{ hasta: 1, suelo: 'mar' }, { hasta: 2.5, suelo: 'mar' }]).length, 1, 'hasta > 2');
  assert.equal(validarGeografia([{ hasta: 0.5, suelo: 'mar' }, { hasta: 0.4, suelo: 'mar' }]).length, 1, 'no creciente');
  assert.equal(validarGeografia([{ hasta: 1, suelo: 'lava' }]).length, 1, 'suelo que no existe');
  // UNA CLAVE QUE NO HACE NADA se rechaza: una clave aceptada que no hace nada es la peor forma de
  // fallar. (Hasta G4 esta lista tenia las claves del plan que todavia no existian — `paredes`,
  // `barrera`, la isla —; ahora existen todas y cada una tiene su test.)
  for (const k of ['forma', 'altura', 'canal']) {
    assert.equal(GEO_CLAVES.indexOf(k), -1, `'${k}' no existe`);
    assert.ok(validarGeografia([{ hasta: 1, suelo: 'mar', [k]: 1 }]).length > 0, `rechaza '${k}'`);
  }
  assert.ok(validarGeografia([{ hasta: 1, suelo: 'mar', lado: 'der' }]).length > 0, 'lado fuera de una costa');
  assert.ok(validarGeografia([{ hasta: 0.5, suelo: 'costa', lado: 'izq' }, { hasta: 1, suelo: 'costa', lado: 'der' }]).length > 0,
    'dos costas pegadas de distinto lado');
});

test('geografia · las misiones que la declaran estan sanas', async () => {
  const { MISIONES_PRUEBA: MP } = await import('../src/data/pruebas_misiones.js');
  for (const m of [...MISSIONS, ...Object.values(MP || {})]) {
    if (!m || m.geografia === undefined) continue;
    // con la distancia de la mision: la forma en km se revisa contra ella (que no se desborde)
    assert.deepEqual(validarGeografia(m.geografia, m.goal.dist || m.goal.meters, m.goal.kind), [], `${m.id}`);
  }
});

test('geografia · el suelo cambia donde dice la data, tambien en la vuelta', () => {
  const terr0 = cfgGeo.terrain;
  cfgGeo.terrain = 'sea';
  setGeografia(GEOGRAFIAS.demo, 1000);
  try {
    // el centro de cada tramo tiene su suelo (los bordes son costuras y se prueban aparte)
    const esperado = [[0.10, 'sea'], [0.25, 'coast'], [0.33, 'sea'], [0.41, 'land'], [0.50, 'sea'],
      [0.60, 'coast'], [1.00, 'sea'], [1.18, 'land'], [1.60, 'sea']];
    for (const [f, s] of esperado) assert.equal(sueloEn(f * 1000), s, `a ${f}`);
    // LA COSTA DE LA DERECHA es la de la izquierda en espejo: tierra del lado positivo
    assert.equal(ladoEn(600), -1);
    assert.equal(esTierraEn(60, 600), true, 'costa der: tierra a la derecha');
    assert.equal(esTierraEn(-60, 600), false, 'costa der: agua a la izquierda');
    assert.equal(esTierraEn(-60, 250), true, 'costa izq: tierra a la izquierda');
    // PASADO EL ULTIMO TRAMO manda el cfg plano (deliberado, como en las fases)
    assert.equal(sueloEn(2500), 'sea');
    // sin tierra no hay relieve, y el mar no tiene loma
    assert.equal(alturaSuelo(0, 500), 0);
  } finally { setGeografia(null, 0); cfgGeo.terrain = terr0; }
});

test('geografia · nada aparece de golpe: las costuras', () => {
  const terr0 = cfgGeo.terrain;
  cfgGeo.terrain = 'sea';
  setGeografia(GEOGRAFIAS.demo, 1000);
  try {
    // LA PLAYA QUE CRUZA (mar → tierra en 0.36): alrededor del borde hay arena, espuma y agua segun
    // la columna — el filo esta despeinado, no es una recta. (mar → costa, en 0.54, NO lleva playa
    // cruzada: la costa entra por el costado.)
    const pl = playaCerca(360 + 2);
    assert.ok(pl, 'hay playa cerca del borde mar→tierra de 0.36');
    assert.equal(playaCerca(540 + 2), null, 'mar → costa no lleva playa cruzada');
    const clases = new Set();
    for (let x = -40; x <= 40; x += 2) clases.add(playaClase(x, 360 + 2, pl));
    assert.ok(clases.size >= 2, `el filo de la playa varia con la x (${[...clases]})`);
    // LA ORILLA ENTRA desde el costado: al principio de la costa (viniendo del mar) esta lejos, del
    // lado de la tierra — o sea todo agua —, y a mitad del tramo esta en su lugar.
    assert.ok(orillaS(201) < -300, `la orilla arranca afuera (${orillaS(201)})`);
    assert.ok(Math.abs(orillaS(250) - shoreAtGeo(250)) < 1, 'a mitad de la costa la orilla esta en su lugar');
    // y al salir al mar (0.30) la orilla vuelve a irse del lado de la tierra: todo agua de nuevo
    assert.ok(orillaS(299) < -300, `la costa sale al mar (${orillaS(299)})`);
    // LA LOMA ARRANCA PLANA en la playa y crece tierra adentro
    assert.equal(escalaRelieve(360 + GEO_PLAYA_U * 0.5), 0, 'en la playa no hay loma');
    assert.ok(escalaRelieve(410) > 0.9, 'a mitad del tramo la loma esta entera');
  } finally { setGeografia(null, 0); cfgGeo.terrain = terr0; }
});

test('geografia · sobrevive a ?qa (la mision comprimida al 6%)', () => {
  // Una costura de 220 m en un tramo de 6 m haria que la rampa no llegara nunca a 1: la costa no
  // existiria. El tope contra el largo del tramo es lo que la comprime junto con la mision.
  const terr0 = cfgGeo.terrain;
  cfgGeo.terrain = 'sea';
  setGeografia(GEOGRAFIAS.demo, 1000 * 0.06);
  try {
    const mitadCosta = 0.25 * 60;
    assert.equal(sueloEn(mitadCosta), 'coast');
    assert.ok(Math.abs(orillaS(mitadCosta) - shoreAtGeo(mitadCosta)) < 1, 'comprimida, la orilla igual llega a su lugar');
  } finally { setGeografia(null, 0); cfgGeo.terrain = terr0; }
});

test('geografia · una costa que se cierra en tierra (y una tierra que se abre en costa)', () => {
  const terr0 = cfgGeo.terrain;
  cfgGeo.terrain = 'sea';
  setGeografia([{ hasta: 0.3, suelo: 'costa' }, { hasta: 0.6, suelo: 'tierra' }, { hasta: 1, suelo: 'costa', lado: 'der' }], 1000);
  try {
    // viniendo de tierra la orilla se va del lado del AGUA (todo tierra) y viniendo de tierra se abre
    assert.ok(orillaS(299) > 300, `la costa se cierra en tierra (${orillaS(299)})`);
    assert.ok(orillaS(601) > 300, `la costa de la derecha arranca toda tierra (${orillaS(601)})`);
    assert.equal(esTierraEn(0, 601), true, 'al salir de la tierra, el carril sigue siendo tierra');
    // costa <-> tierra no lleva playa cruzada: la costura es la orilla que se corre
    assert.equal(playaCerca(300 + 2), null);
  } finally { setGeografia(null, 0); cfgGeo.terrain = terr0; }
});

// ---------------------------------------------------------------------------------------------
// G2 · LA NIEBLA PUESTA
// ---------------------------------------------------------------------------------------------
import { bancoNiebla, geo as geoN } from '../src/core/geografia.js';
import { stepFog, inBank, fogFade, fogVis, resetFog } from '../src/systems/fog.js';
import { FOG_FADE as FOG_FADE_U } from '../src/data/tuning.js';

test('geografia G2 · la clave niebla: 1 o 2, sobre cualquier suelo', () => {
  assert.deepEqual(validarGeografia([{ hasta: 1, suelo: 'mar', niebla: 1 }]), []);
  assert.deepEqual(validarGeografia([{ hasta: 1, suelo: 'tierra', niebla: 2 }]), []);
  assert.ok(validarGeografia([{ hasta: 1, suelo: 'mar', niebla: 3 }]).length > 0, 'niebla 3 no existe');
  assert.ok(validarGeografia([{ hasta: 1, suelo: 'mar', niebla: true }]).length > 0, 'niebla es un numero');
});

test('geografia G2 · dos tramos seguidos con niebla son UN banco (el fundido no hace pozo)', () => {
  setGeografia([{ hasta: 0.2, suelo: 'mar' }, { hasta: 0.3, suelo: 'mar', niebla: 1 },
    { hasta: 0.4, suelo: 'costa', niebla: 2 }, { hasta: 0.6, suelo: 'mar' }, { hasta: 0.7, suelo: 'mar', niebla: 1 }], 1000);
  try {
    assert.equal(geoN.nieblas.length, 2, 'dos bancos: 0.2-0.4 (juntado) y 0.6-0.7');
    assert.deepEqual(geoN.nieblas[0], { z0: 200, z1: 400, dens: 2 }, 'el juntado toma la densidad mas cerrada');
    assert.equal(bancoNiebla(100).z0, 200, 'antes del primero, rige el proximo');
    assert.equal(bancoNiebla(500).z0, 600, 'entre los dos, rige el segundo');
    assert.equal(bancoNiebla(900), null, 'pasado el ultimo, ninguno');
    setGeografia([{ hasta: 1, suelo: 'mar' }], 1000);
    assert.equal(geoN.nieblas, null, 'una geografia sin niebla no declara bancos');
  } finally { setGeografia(null, 0); }
});

test('geografia G2 · el SISTEMA de niebla obedece a la data: donde, cuanto, y con fundido', () => {
  // Se prueba systems/fog.js entero —no solo la lista— moviendo el odometro, que es lo unico que el
  // sistema lee. cfg.fog en 0: sin la data no habria ni un banco, asi que todo lo que aparezca es
  // de la geografia. Y despues en 2: la data sigue mandando, el sorteo no suma bancos encima.
  const d0 = runGeo.dist, fog0 = cfgGeo.fog;
  try {
    for (const fogCfg of [0, 2]) {
      cfgGeo.fog = fogCfg;
      setGeografia([{ hasta: 0.3, suelo: 'mar' }, { hasta: 0.5, suelo: 'mar', niebla: 1 }, { hasta: 1, suelo: 'mar' }], 3000);
      resetFog();
      const en = d => { runGeo.dist = d; stepFog(); return { dentro: inBank(), fade: fogFade(), vis: fogVis() }; };
      assert.deepEqual([en(400).dentro, en(400).fade], [false, 0], `lejos del banco: nada (cfg.fog ${fogCfg})`);
      const antes = en(900 - FOG_FADE_U / 2);
      assert.ok(!antes.dentro && antes.fade > 0 && antes.fade < 1, `la bruma se ve VENIR antes del borde (fade ${antes.fade})`);
      const adentro = en(1200);
      assert.ok(adentro.dentro && adentro.fade === 1, 'adentro del banco: niebla entera');
      assert.ok(adentro.vis < 1e8, 'y recorta la vista (densidad 1 de la data)');
      const despues = en(1500 + FOG_FADE_U / 2);
      assert.ok(!despues.dentro && despues.fade > 0 && despues.fade < 1, 'y se va con fundido');
      for (const d of [2000, 2500, 2990]) assert.equal(en(d).dentro, false, `pasado el banco no aparece ninguno mas (a ${d} m, cfg.fog ${fogCfg})`);
    }
  } finally { runGeo.dist = d0; cfgGeo.fog = fog0; setGeografia(null, 0); resetFog(); }
});


// ---------------------------------------------------------------------------------------------
// G3 · ACANTILADOS Y BARRERAS POR TRAMO
// ---------------------------------------------------------------------------------------------
import { zigzagDe, aFracciones } from '../src/core/geografia.js';
import * as zzG3 from '../src/core/zigzag.js';

// Una geografia con los tres lados y una barrera, montada sobre el nucleo del zigzag tal como la
// monta el sistema: `rebuild` con la spec que sale de `zigzagDe`. Sin arranque (0) para que la
// cuenta no dependa de la pista.
const G3_LISTA = [
  { hasta: 0.20, suelo: 'mar' },
  { hasta: 0.40, suelo: 'mar', paredes: 'izq' },
  { hasta: 0.60, suelo: 'mar', paredes: 'ambos', barrera: 'roca' },
  { hasta: 0.80, suelo: 'tierra', paredes: 'der' },
  { hasta: 2.00, suelo: 'mar' },
];
function montarG3(lista, obj) {
  const spec = zigzagDe(lista);
  zzG3.reset();
  zzG3.rebuild(0, spec, obj, 0, 0);
  return spec;
}
// ¿se muere a ras (y 1,5) bien metido en la roca de ese lado? x a 25 m pasado el pie de la pared
const muereDe = (lado, wz) => zzG3.enPared(lado * (zzG3.paredXAt(wz, lado) + 25), 1.5, wz, 0, 1) === lado;

test('geografia G3 · paredes y barrera: el validador y la spec que sale de la data', () => {
  assert.deepEqual(validarGeografia(G3_LISTA), []);
  assert.ok(validarGeografia([{ hasta: 1, suelo: 'mar', paredes: 'arriba' }]).length > 0, 'paredes que no existen');
  assert.ok(validarGeografia([{ hasta: 1, suelo: 'mar', barrera: 'roca' }]).length > 0, 'barrera sin paredes');
  assert.ok(validarGeografia([{ hasta: 1, suelo: 'mar', paredes: 'izq', barrera: 'roca' }]).length > 0,
    'barrera con un lado abierto: se la rodea');
  assert.ok(validarGeografia([{ hasta: 1, suelo: 'mar', paredes: 'ambos', barrera: 'arco' }]).length > 0, 'piel que no existe');
  const spec = zigzagDe(G3_LISTA);
  assert.deepEqual(zzG3.validarZigzag(spec), [], 'la spec que arma la geografia la acepta el zigzag');
  assert.equal(spec.amp, 0, 'el carril no dobla: el pasillo sigue siendo pasillo');
  assert.deepEqual(spec.ventanas.map(v => [v.desde, v.hasta, v.lado]), [[0.2, 0.4, 'izq'], [0.4, 0.6, 'ambos'], [0.6, 0.8, 'der']]);
  assert.equal(zigzagDe([{ hasta: 2, suelo: 'mar' }]), null, 'sin paredes no hay zigzag: todo queda como antes');
  for (const [n, g] of Object.entries(GEOGRAFIAS)) {
    const z = zigzagDe(g);
    if (z) assert.deepEqual(zzG3.validarZigzag(z), [], `la geografia '${n}'`);
  }
  // el zigzag rechaza ventanas mal escritas, igual que el resto de su data
  assert.ok(zzG3.validarZigzag({ amp: 0, ventanas: [{ desde: 0.5, hasta: 0.4, lado: 'izq' }] }).length > 0);
  assert.ok(zzG3.validarZigzag({ amp: 0, desde: 0.1, ventanas: [{ desde: 0.2, hasta: 0.4, lado: 'izq' }] }).length > 0,
    'ventanas y desde/hasta son excluyentes');
  assert.ok(zzG3.validarZigzag({ amp: 0, ventanas: [{ desde: 0.2, hasta: 0.4, lado: 'der', barrera: 'roca' }] }).length > 0);
});

test('geografia G3 · contra la pared de un lado se muere y del otro se pasa; ambos cierra los dos', () => {
  const obj = 5000;
  montarG3(G3_LISTA, obj);
  try {
    const izq = 0.30 * obj, amb = 0.52 * obj, der = 0.70 * obj, mar = 0.10 * obj, vuelta = 1.5 * obj;
    assert.ok(muereDe(-1, izq), 'tramo izq: la pared izquierda mata');
    assert.equal(zzG3.paredH(izq, 1), 0, 'tramo izq: a la derecha no hay roca');
    assert.equal(zzG3.enPared(60, 1.5, izq, 0, 1), 0, 'tramo izq: por la derecha se pasa, bien afuera');
    assert.ok(muereDe(-1, amb) && muereDe(1, amb), 'tramo ambos: matan los dos lados');
    assert.ok(muereDe(1, der), 'tramo der: la pared derecha mata');
    assert.equal(zzG3.paredH(der, -1), 0, 'tramo der: a la izquierda no hay roca');
    assert.equal(zzG3.enPared(-60, 1.5, der, 0, 1), 0, 'tramo der: por la izquierda se pasa');
    for (const d of [mar, vuelta]) {
      assert.equal(zzG3.paredH(d, -1) + zzG3.paredH(d, 1), 0, `sin paredes a ${d} m`);
      assert.equal(zzG3.ladoEn(d), null);
      assert.equal(zzG3.paredesTapan(d), 0, 'el marco vuelve donde no hay acantilado');
    }
    assert.deepEqual([zzG3.ladoEn(izq), zzG3.ladoEn(amb), zzG3.ladoEn(der)], ['izq', 'ambos', 'der']);
    // FUERA DE LOS ACANTILADOS EL CARRIL ESTA ABIERTO: ni muro invisible para la siembra ni tope
    const seg = zzG3.carrilSeguro(mar, 100, 0);
    assert.ok(seg.lo < -100 && seg.hi > 100, `carril abierto en mar libre (${seg.lo}, ${seg.hi})`);
    assert.equal(zzG3.topeCarril(40, mar, 0), 40, 'sin paredes cerca, nadie topa a los que se mueven');
    // sin antiaereos en las lomas (decision 3 del autor)
    for (let d = izq; d < der; d += 37) assert.equal(zzG3.puestoLadera(d, -1), null);
  } finally { zzG3.reset(); }
});

test('geografia G3 · nada aparece de golpe: las paredes entran con fundido y no se hunden en las junturas', () => {
  const obj = 5000;
  montarG3(G3_LISTA, obj);
  try {
    // LA JUNTURA izq -> ambos (0.40): la pared izquierda sigue de largo, a pleno
    for (let d = 0.37 * obj; d <= 0.43 * obj; d += 5) {
      assert.equal(zzG3.ventanaLado(d, -1, zzG3.zz.spec, obj), 1, `la pared izquierda no se hunde en la juntura (${d})`);
    }
    // y la ventana de cada lado sube y baja sin escalones: paso maximo por metro
    for (const lado of [-1, 1]) {
      let prev = 0, salto = 0;
      for (let d = 0; d < obj; d += 1) {
        const v = zzG3.ventanaLado(d, lado, zzG3.zz.spec, obj);
        salto = Math.max(salto, Math.abs(v - prev)); prev = v;
      }
      assert.ok(salto < 0.02, `lado ${lado}: la ventana salta ${salto.toFixed(3)} en un metro`);
    }
  } finally { zzG3.reset(); }
});

test('geografia G3 · la barrera PUESTA: donde dice la data, con las dos laderas arriba, y mata', () => {
  const obj = 5000;
  montarG3(G3_LISTA, obj);
  try {
    const b = zzG3.barreraCerca(0, obj);
    assert.ok(b, 'hay una barrera');
    assert.equal(b.tipo, 'roca');
    assert.ok(b.z0 >= 0.40 * obj && b.z1 <= 0.50 * obj, `cae al principio del tramo (${b.z0 | 0}-${b.z1 | 0})`);
    for (const d of [b.z0, b.z1]) for (const lado of [-1, 1]) {
      assert.ok(zzG3.ventanaLado(d, lado, zzG3.zz.spec, obj) >= 0.95, 'las dos laderas ya estan hechas');
    }
    const c = (b.z0 + b.z1) / 2;
    assert.ok(zzG3.enBarrera(0, 2, c), 'a ras contra la roca se muere');
    assert.equal(zzG3.enBarrera(0, b.y1 + 3, c), null, 'por encima se pasa');
    // UNA sola: el sorteo esta apagado (las pone la data), tambien con la perilla de OPCIONES en MUCHAS
    zzG3.rebuild(0, zzG3.zz.spec, obj, 0, 2);
    let n = 0;
    for (let d = 0; d < 2 * obj; d += 11) if (zzG3.barreraDe(d) && zzG3.barreraDe(d).z0 > (d - 11)) n++;
    assert.equal(n, 1, 'una barrera puesta y ninguna sorteada');
    // cada piel sale igual que la sorteada: la misma pieza
    for (const piel of ['puente', 'madera', 'cables']) {
      montarG3([{ hasta: 0.3, suelo: 'mar' }, { hasta: 0.6, suelo: 'mar', paredes: 'ambos', barrera: piel }, { hasta: 2, suelo: 'mar' }], obj);
      const bp = zzG3.barreraCerca(0, obj);
      assert.equal(bp && bp.tipo, piel);
      assert.ok(bp.y0 > 0, `${piel}: se pasa por abajo`);
    }
  } finally { zzG3.reset(); }
});

test('geografia G3 · sobrevive a ?qa (la mision comprimida al 6%)', () => {
  const obj = 5000 * 0.06;
  montarG3(G3_LISTA, obj);
  try {
    const amb = 0.5 * obj;
    assert.ok(zzG3.paredH(amb, -1) > 0 && zzG3.paredH(amb, 1) > 0, 'el acantilado existe comprimido');
    // la izquierda es UN acantilado de 0.2 a 0.6 (izq + ambos juntados): su centro llega a pleno
    assert.equal(zzG3.ventanaLado(0.4 * obj, -1, zzG3.zz.spec, obj), 1, 'y llega a pleno');
    const b = zzG3.barreraCerca(0, obj);
    assert.ok(b && b.z0 >= 0.4 * obj && b.z1 <= 0.6 * obj, 'la barrera sigue adentro de su tramo');
  } finally { zzG3.reset(); }
});

test('geografia G3 · ninguna mision declara un zigzag: Y acantilados en la geografia', async () => {
  // si las dos estuvieran, gana el `zigzag:` y los acantilados de la geografia no se verian nunca —
  // un mapa escrito que no se juega (PLAN_GEOGRAFIA §20)
  const { MISIONES_PRUEBA: MP } = await import('../src/data/pruebas_misiones.js');
  for (const m of [...MISSIONS, ...Object.values(MP || {})]) {
    if (!m || !m.zigzag) continue;
    assert.equal(zigzagDe(aFracciones(m.geografia, m.goal.dist || m.goal.meters)), null, `${m.id}: zigzag y paredes en la geografia`);
  }
});

test('geografia G3 · la forma CLASICA del zigzag no cambio (m5 y los presets)', async () => {
  // las funciones que ganaron un parametro `wz` o una rama por lado contestan lo mismo que antes
  // con la spec de siempre: `ventanaLado` es `ventana`, `ladoEn` es `paredes.lado`, y el marco se
  // apaga en toda la corrida como siempre
  const { MISSIONS: MS } = await import('../src/data/missions.js');
  const m5 = MS.find(m => m.zigzag);
  assert.ok(m5, 'hay una mision con callejon');
  zzG3.reset();
  zzG3.rebuild(0, m5.zigzag, 2600, 700, 1);
  try {
    for (let d = 0; d < 2600; d += 13) for (const lado of [-1, 1]) {
      assert.equal(zzG3.ventanaLado(d, lado, m5.zigzag, 2600), zzG3.ventana(d, m5.zigzag, 2600));
    }
    assert.equal(zzG3.ladoEn(1500), zzG3.pared().lado);
    assert.equal(zzG3.paredesTapan(10), 1);
    assert.equal(zzG3.pared().puestas, false);
    assert.equal(zzG3.pared().puestos, true, 'los antiaereos de San Carlos siguen en las lomas');
  } finally { zzG3.reset(); }
});

// ---------------------------------------------------------------------------------------------
// G4 · LA ISLA
// ---------------------------------------------------------------------------------------------
import { islaAltura, islaEn } from '../src/core/geografia.js';
import { GEO_ISLA_ALTO as ISLA_ALTO_U, GEO_ISLA_PENDIENTE as ISLA_P_U, GEO_ISLA_IMPACTO as ISLA_IMP_U,
  FLY_X as FLY_X_U } from '../src/data/tuning.js';

// una isla de lado a lado, una parcial con canal a la derecha y una con farallon, separadas por mar
const G4_LISTA = [
  { hasta: 0.20, suelo: 'mar' },
  { hasta: 0.30, suelo: 'isla' },
  { hasta: 0.40, suelo: 'mar' },
  { hasta: 0.48, suelo: 'isla', alto: 12, ancho: 0.6, x: -18 },
  { hasta: 0.60, suelo: 'mar' },
  { hasta: 0.66, suelo: 'isla', alto: 16, borde: 'acantilado' },
  { hasta: 2.00, suelo: 'mar' },
];
const G4_OBJ = 6000;

test('geografia G4 · el validador: la isla, sus claves y el techo del radar', () => {
  assert.deepEqual(validarGeografia(G4_LISTA), []);
  const e = l => validarGeografia(l).length;
  assert.ok(e([{ hasta: 1, suelo: 'mar', alto: 10 }]) > 0, "'alto' fuera de una isla");
  assert.ok(e([{ hasta: 1, suelo: 'isla', alto: 30 }]) > 0, 'una isla por encima del radar, sin decirlo');
  assert.equal(e([{ hasta: 1, suelo: 'isla', alto: 30, expone: true }]), 0, '...salvo que la data lo diga (decision 1)');
  assert.ok(e([{ hasta: 1, suelo: 'isla', ancho: 1.4 }]) > 0, 'ancho > 1');
  assert.ok(e([{ hasta: 1, suelo: 'isla', x: 10 }]) > 0, "'x' sin isla parcial");
  assert.ok(e([{ hasta: 1, suelo: 'isla', ancho: 0.5, x: 60 }]) > 0, "'x' fuera del carril");
  assert.ok(e([{ hasta: 1, suelo: 'isla', borde: 'muro' }]) > 0, 'borde que no existe');
  assert.ok(e([{ hasta: 1, suelo: 'isla', paredes: 'ambos' }]) > 0, 'la isla ES la barrera');
  assert.ok(e([{ hasta: 0.5, suelo: 'tierra' }, { hasta: 1, suelo: 'isla' }]) > 0, 'pegada a tierra no es isla');
  assert.ok(e([{ hasta: 0.5, suelo: 'isla' }, { hasta: 1, suelo: 'costa' }]) > 0, 'y despues tampoco');
});

test('geografia G4 · la isla es mar de base y tierra encima: el suelo, la tierra y el relieve', () => {
  setGeografia(G4_LISTA, G4_OBJ);
  try {
    const c = 0.25 * G4_OBJ;
    assert.equal(sueloEn(c), 'sea', 'el raster y la siembra la ven como mar (la rodean de agua)');
    assert.equal(esTierraEn(0, c), true, 'pero el vuelo sabe que hay tierra');
    assert.equal(esTierraEn(0, 0.1 * G4_OBJ), false);
    const h = alturaSuelo(0, c);
    assert.ok(h > ISLA_ALTO_U * 0.75 && h <= ISLA_ALTO_U * 1.01, `la cumbre de la isla por defecto (${h.toFixed(1)} m)`);
    assert.equal(alturaSuelo(0, 0.2 * G4_OBJ - 1), 0, 'antes de la isla, el agua');
    assert.ok(islaEn(c) && !islaEn(0.35 * G4_OBJ), 'islaEn');
    assert.ok(islaEn(0.2 * G4_OBJ - 30, 40), 'islaEn con margen: la siembra no planta pegado');
    // de lado a lado de verdad: la misma altura a los dos bordes del carril
    assert.ok(alturaSuelo(-FLY_X_U, c) > ISLA_ALTO_U * 0.75 && alturaSuelo(FLY_X_U, c) > ISLA_ALTO_U * 0.75);
  } finally { setGeografia(null, 0); }
});

test('geografia G4 · la parcial deja un canal: por ahi se pasa sin subir', () => {
  setGeografia(G4_LISTA, G4_OBJ);
  try {
    const c = 0.44 * G4_OBJ;
    // tapa de -18-22.8 a -18+22.8: el canal va de ~5 a 38
    // (> la mitad de `alto`: desde el 30/9 el lomo tiene hondonadas y la rampa es mas llana)
    assert.ok(alturaSuelo(-25, c) > 6, `sobre la isla hay cerro (${alturaSuelo(-25, c).toFixed(1)} m)`);
    for (const x of [8, 20, 30, FLY_X_U]) {
      assert.equal(alturaSuelo(x, c), 0, `en el canal (x ${x}) es agua`);
      assert.equal(esTierraEn(x, c), false);
    }
  } finally { setGeografia(null, 0); }
});

test('geografia G4 · la entrada por playa se sigue con el gas; el farallon se choca (medido en Node)', () => {
  setGeografia(G4_LISTA, G4_OBJ);
  try {
    const d0 = 0.20 * G4_OBJ;
    // LA PENDIENTE NUNCA PASA LA DE LA DATA, tampoco en el hombro donde la subida entra a la cumbre
    let pmax = 0;
    for (let z = d0 - 5; z < d0 + 400; z += 0.5) {
      pmax = Math.max(pmax, (alturaSuelo(0, z + 0.5) - alturaSuelo(0, z)) / 0.5);
    }
    assert.ok(pmax <= ISLA_P_U * 1.02, `pendiente maxima de la entrada ${pmax.toFixed(3)} (data ${ISLA_P_U})`);
    // Y SE SIGUE: el avion a ras (2,4 m) que da gas al llegar a la arena no toca el suelo. La misma
    // cuenta vertical del pasillo (flight.js: TH 55, G 22, tope 18 m/s). A crucero, dando gas SOBRE
    // la arena; con turbo, 30 m antes (medido: alcanza con 20, una decima de segundo — la cumbre se
    // ve desde 1400 m) y a fondo con los escalones del turbo sostenido (280), 60 m antes.
    for (const [spd, antes] of [[150, 0], [225, 30], [280, 60]]) {
      const dt = 1 / 60;
      let y = 2.4, vy = 0, z = d0 - antes, roza = 0;
      while (z < d0 + 450) {
        vy = Math.min(18, vy + (55 - 22) * dt);
        y += vy * dt; z += spd * dt;
        if (y < alturaSuelo(0, z) + 0.5) roza++;
        if (y > ISLA_ALTO_U + 3) { vy = 0; y = ISLA_ALTO_U + 3; }   // arriba, se nivela
      }
      assert.equal(roza, 0, `a ${spd} m/s dando gas ${antes} m antes de la arena, cuadros rozando: ${roza}`);
    }
    // CUANTO SUBE EL SUELO EN UN CUADRO (a 30 cuadros por segundo, el peor caso): en la playa nunca
    // llega al choque; contra el farallon si
    const salto = (x, z0, z1, dz) => {
      let m = 0;
      for (let z = z0; z < z1; z += 0.5) m = Math.max(m, alturaSuelo(x, z + dz) - alturaSuelo(x, z));
      return m;
    };
    const dz = 225 / 30;
    assert.ok(salto(0, d0 - 5, d0 + 300, dz) < ISLA_IMP_U, 'la playa se roza, no se choca');
    const a0 = 0.60 * G4_OBJ;
    assert.ok(salto(0, a0 - 5, a0 + 60, 150 / 30) > ISLA_IMP_U, 'el farallon se choca aun a crucero');
    // el FLANCO de la parcial, de costado (30 m/s de palanca): se roza, no se choca de un cuadro
    const c = 0.44 * G4_OBJ;
    let mx = 0;
    for (let x = 10; x > -18; x -= 0.25) mx = Math.max(mx, alturaSuelo(x - 1, c) - alturaSuelo(x, c));
    assert.ok(mx < ISLA_IMP_U, `el flanco sube ${mx.toFixed(2)} m por cuadro de costado`);
  } finally { setGeografia(null, 0); }
});

test('geografia G4 · sobrevive a ?qa (la mision comprimida al 6%)', () => {
  setGeografia(G4_LISTA, G4_OBJ * 0.06);
  try {
    const c = 0.25 * G4_OBJ * 0.06;
    assert.equal(esTierraEn(0, c), true, 'la isla sigue estando');
    const h = alturaSuelo(0, c);
    assert.ok(h >= 0 && h < ISLA_ALTO_U, `y comprimida es mas baja, nunca mas empinada (${h.toFixed(2)} m)`);
  } finally { setGeografia(null, 0); }
});


// ---------------------------------------------------------------------------------------------
// G5 · EN KILOMETROS, ANTES Y DESPUES DEL BLANCO
// ---------------------------------------------------------------------------------------------
test('geografia G5 · la forma en km se traduce a fracciones: tramos, resto, y la vuelta desde el blanco', () => {
  const g = {
    ida: [{ km: 2, suelo: 'mar' }, { km: 1, suelo: 'isla' }, { suelo: 'mar' }],
    vuelta: [{ km: 1.5, suelo: 'tierra' }, { suelo: 'mar' }],
  };
  assert.deepEqual(aFracciones(g, 6000).map(t => [t.suelo, +t.hasta.toFixed(4)]),
    [['mar', 0.3333], ['isla', 0.5], ['mar', 1], ['tierra', 1.25], ['mar', 2]]);
  assert.ok(aFracciones(g, 6000).every(t => t.km === undefined), 'el km no queda en la lista traducida');
  assert.equal(g.ida[0].km, 2, 'la data de la mision no se toca');
  // una ida que no llega al blanco, con vuelta: lo que falta se completa con mar
  const corta = aFracciones({ ida: [{ km: 1, suelo: 'tierra' }], vuelta: [{ suelo: 'costa' }] }, 4000);
  assert.deepEqual(corta.map(t => [t.suelo, t.hasta]), [['tierra', 0.25], ['mar', 1], ['costa', 2]]);
  // la de fracciones pasa tal cual
  assert.equal(aFracciones(GEOGRAFIAS.demo, 6000), GEOGRAFIAS.demo);
});

test('geografia G5 · el validador de la forma en km', () => {
  const ok = { ida: [{ km: 2, suelo: 'mar' }, { suelo: 'mar' }] };
  assert.deepEqual(validarGeografia(ok, 6000), []);
  assert.deepEqual(validarGeografia(ok), [], 'sin distancia se revisa igual (todo menos el desborde)');
  assert.ok(validarGeografia({ ida: [{ km: 5, suelo: 'mar' }, { km: 2, suelo: 'mar' }] }, 6000).length > 0, 'se desborda');
  assert.ok(validarGeografia({ ida: [{ suelo: 'mar' }, { km: 2, suelo: 'mar' }] }, 6000).length > 0, 'solo el ultimo va sin km');
  assert.ok(validarGeografia({ ida: [{ km: 1, hasta: 0.5, suelo: 'mar' }] }, 6000).length > 0, "'hasta' no va en km");
  assert.ok(validarGeografia({ ida: [{ km: -1, suelo: 'mar' }] }, 6000).length > 0, 'km negativo');
  assert.ok(validarGeografia({ idas: [] }, 6000).length > 0, 'clave desconocida');
  assert.ok(validarGeografia({ ida: [{ km: 1, suelo: 'lava' }] }, 6000).length > 0, 'las claves de cada tramo se revisan igual');
  assert.ok(validarGeografia({ ida: [{ km: 1, suelo: 'tierra' }, { suelo: 'isla' }] }, 6000).length > 0,
    'y las reglas entre tramos tambien (isla pegada a tierra)');
  assert.deepEqual(validarGeografia(GEOGRAFIAS.km, 6000), [], 'la geografia con nombre `km`, en t17');
});

test('geografia G5 · se carga contra la distancia DECLARADA: sobrevive a ?qa', () => {
  const g = { ida: [{ km: 3, suelo: 'mar' }, { km: 1, suelo: 'tierra' }, { suelo: 'mar' }] };
  // la mision declara 6 km; con ?qa el run mide el 6%
  setGeografia(g, 6000 * 0.06, 6000);
  try {
    const obj = 6000 * 0.06;
    assert.equal(sueloEn(0.58 * obj), 'land', 'la tierra de 3 a 4 km cae en 0.5-0.67 tambien comprimida');
    assert.equal(sueloEn(0.3 * obj), 'sea');
  } finally { setGeografia(null, 0); }
});

test('geografia G5 · el tramo del BLANCO: centrado en el objetivo, y la ida y la vuelta a sus lados', () => {
  const g = {
    ida: [{ km: 2, suelo: 'mar' }, { suelo: 'mar' }],
    blanco: { km: 1, suelo: 'isla', alto: 8 },
    vuelta: [{ km: 1, suelo: 'mar' }, { suelo: 'mar' }],
  };
  assert.deepEqual(validarGeografia(g, 6000), []);
  const L = aFracciones(g, 6000);
  const isla = L.find(t => t.suelo === 'isla');
  assert.ok(Math.abs(isla.hasta - (1 + 500 / 6000)) < 1e-9, 'termina medio km pasado el objetivo');
  assert.ok(Math.abs(L[L.indexOf(isla) - 1].hasta - (1 - 500 / 6000)) < 1e-9, 'y empieza medio km antes');
  assert.ok(Math.abs(L[L.indexOf(isla) + 1].hasta - (1 + 1500 / 6000)) < 1e-9, 'la vuelta cuenta desde donde termina');
  assert.equal(L[L.length - 1].hasta, 2);
  // la ida ya no tiene 6 km: tiene 5,5
  assert.ok(validarGeografia({ ida: [{ km: 5.8, suelo: 'mar' }], blanco: { km: 1, suelo: 'tierra' } }, 6000).length > 0,
    'la ida se desborda contra el tramo del blanco');
});

test('geografia G5 · lo que hay debajo del blanco: el buque en el agua, la estructura en tierra', () => {
  const conIsla = { ida: [{ suelo: 'mar' }], blanco: { km: 0.8, suelo: 'isla', alto: 8 }, vuelta: [{ suelo: 'mar' }] };
  assert.deepEqual(validarGeografia(conIsla, 6000, 'estructura'), []);
  assert.ok(validarGeografia(conIsla, 6000, 'ship').length > 0, 'un buque sobre una isla');
  assert.ok(validarGeografia({ ida: [{ suelo: 'mar' }] }, 6000, 'estructura').length > 0, 'una estructura en el agua');
  assert.deepEqual(validarGeografia(GEOGRAFIAS.demo, 6000, 'ship'), [], 'la demo deja el buque en el mar');
  assert.deepEqual(validarGeografia(GEOGRAFIAS.km, 6000, 'ship'), []);
  assert.deepEqual(validarGeografia({ ida: [{ suelo: 'mar' }], blanco: { km: 0.6, suelo: 'tierra', lomas: 4 } }, 6000, 'estructura'), []);
});

test('geografia G5 · la EXPLANADA: bajo el blanco el suelo es un piso, y alturaBlanco lo dice', async () => {
  const { alturaBlanco, sueloBlanco } = await import('../src/core/geografia.js');
  const { GEO_EXPLANADA } = await import('../src/data/tuning.js');
  const g = { ida: [{ suelo: 'mar' }], blanco: { km: 1, suelo: 'isla', alto: 10 }, vuelta: [{ suelo: 'mar' }] };
  setGeografia(g, 6000, 6000);
  try {
    assert.equal(sueloBlanco(), 'isla');
    const h = alturaBlanco();
    assert.ok(h > 6, `el piso esta arriba de la isla (${h.toFixed(1)} m)`);
    for (let dz = -GEO_EXPLANADA; dz <= GEO_EXPLANADA; dz += 10) for (const x of [-30, 0, 30]) {
      assert.ok(Math.abs(alturaSuelo(x, 6000 + dz) - h) < 1e-9, `plano en (${x}, ${dz})`);
    }
    setGeografia({ ida: [{ suelo: 'mar' }] }, 6000, 6000);
    assert.equal(alturaBlanco(), 0, 'en el agua el piso es el agua');
    assert.equal(sueloBlanco(), 'mar');
    setGeografia(null, 6000);
    assert.equal(sueloBlanco(), null);
  } finally { setGeografia(null, 0); }
});

// ---------------------------------------------------------------------------------------------
// EL BLANCO ESTRUCTURA (data/estructuras.js, PLAN_GEOGRAFIA §11)
// ---------------------------------------------------------------------------------------------
test('estructura · la tabla: cada una tiene perfil, y sus piezas cubren las 20 columnas sin huecos ni solapes', async () => {
  const { ESTRUCTURAS } = await import('../src/data/estructuras.js');
  const { PERFIL } = await import('../src/data/blanco.js');
  for (const [n, e] of Object.entries(ESTRUCTURAS)) {
    const p = PERFIL[e.clase];
    assert.ok(p && p.length === 20, `${n}: su clase '${e.clase}' tiene perfil de 20 franjas`);
    const cubre = new Array(20).fill(0);
    for (const pz of e.piezas) {
      assert.ok(['cerco', 'tanque', 'barraca', 'deposito', 'hangar', 'torre', 'antena'].includes(pz.tipo), `${n}: tipo '${pz.tipo}'`);
      for (let i = pz.de; i <= pz.a; i++) cubre[i]++;
    }
    assert.deepEqual(cubre, new Array(20).fill(1), `${n}: cada columna del perfil tiene UNA pieza que la dibuja`);
  }
});

test('estructura · la suelta mide contra el PISO del blanco: subir el piso es bajar el avion', async () => {
  const cb = await import('../src/core/blanco.js');
  // el mismo perfil ('base') como buque (piso = agua) y como estructura en tierra LLANA (lomas 0):
  // la tierra detona a 0,3 y el agua a 1, asi que soltar Δ m (−0,7) contra la estructura tiene que
  // dar exactamente lo mismo que contra el buque
  setGeografia({ ida: [{ suelo: 'tierra', lomas: 0 }] }, 6000, 6000);
  try {
    const { alturaBlanco } = await import('../src/core/geografia.js');
    const base = alturaBlanco() + cb.TIERRA;
    const D = base - cb.AGUA;
    for (const [y, zB, spd] of [[10, 160, 100], [14, 200, 120], [8, 140, 76], [18, 260, 140], [3, 90, 100]]) {
      cb.resetBlanco(true, 'X', 'base', 'buque');
      const buque = cb.predecir(0, y, 0, 0, spd, zB, 0);
      cb.resetBlanco(true, 'BASE COSTERA', 'base', 'estructura', base);
      assert.equal(cb.blanco.tipo, 'estructura');
      const est = cb.predecir(0, y + D, 0, 0, spd, zB, 0);
      assert.equal(est, buque, `a ${y} m / ${zB} / ${spd}: buque '${buque}', estructura '${est}'`);
    }
  } finally { setGeografia(null, 0); }
  cb.resetBlanco(false);
  assert.equal(cb.blanco.base, cb.AGUA, 'sin piso, el de siempre: el agua');
  assert.equal(cb.blanco.tipo, 'buque');
});

test('estructura · el climax: una estructura va siempre a la suelta, y t18 la declara bien', async () => {
  const { MISIONES_PRUEBA: MP } = await import('../src/data/pruebas_misiones.js');
  const { climaxDeclarado: cd } = await import('../src/data/missions.js');
  const { estructura } = await import('../src/data/estructuras.js');
  const t18 = MP.find(m => m.id === 't18');
  assert.ok(t18, 't18 existe');
  assert.equal(t18.goal.kind, 'estructura');
  assert.ok(estructura(t18.goal.nombre), `'${t18.goal.nombre}' esta en data/estructuras.js`);
  assert.equal(cd(t18), 'suelta');
  assert.equal(cd({ goal: { kind: 'estructura' }, climax: 'pasada' }), 'suelta', 'aunque pida otro climax: la pasada es de buques');
  // toda mision con estructura nombra una que existe
  for (const m of [...MISSIONS, ...MP]) if (m.goal.kind === 'estructura') assert.ok(estructura(m.goal.nombre), m.id);
});

test('estructura · la cuenta ve las lomas, y en el terreno de t18 igual hay sueltas buenas', async () => {
  // t18: la base en tierra con lomas 2. La cuenta de la suelta pregunta el suelo REAL delante del
  // blanco (`pisoEn`), asi que lo que da por bueno no se come una loma — por construccion. Lo que se
  // cuida aca es el otro lado: que con las lomas la ventana no desaparezca.
  const cb = await import('../src/core/blanco.js');
  const { alturaBlanco } = await import('../src/core/geografia.js');
  const { MISIONES_PRUEBA: MP } = await import('../src/data/pruebas_misiones.js');
  const t18 = MP.find(m => m.id === 't18');
  setGeografia(t18.geografia, 6000, 6000);
  try {
    cb.resetBlanco(true, 'BASE COSTERA', 'base', 'estructura', alturaBlanco() + cb.TIERRA);
    let buenas = 0;
    for (const x of [-20, 0, 12]) for (const y of [9, 12, 16, 19]) for (const spd of [76, 100, 130]) for (let zB = 80; zB < 420; zB += 20) {
      const r = cb.predecir(x, y, 0, 0, spd, zB, 0);
      if (r === 'centro' || r === 'extremo') buenas++;
    }
    assert.ok(buenas > 20, `la cuenta tiene que encontrar sueltas buenas (${buenas})`);
  } finally { setGeografia(null, 0); cb.resetBlanco(false); }
});

// ---------- EL SIDEWINDER (core/aim9.js) ----------
// El pedido del autor (30/9/2026), escrito como reglas y medido contra el vuelo REAL: el alabeo de
// core/physics.js y la duracion de las piruetas de data/moves.js, no numeros copiados. Si alguien
// retoca el tonel, el enfriamiento o la velocidad lateral del avion, esto dice si el misil sigue
// siendo esquivable — que es lo unico que importa de el.
{
  const A9 = await import('../src/core/aim9.js');
  const { AIM9: P9 } = await import('../src/data/tuning.js');
  const { bankStep: bStep, bankVx: bVx } = await import('../src/core/physics.js');
  const { MOVES: MV } = await import('../src/data/moves.js');
  const PZ9 = 14, DT9 = 1 / 60, CD9 = 1.15;   // PZ de render/ctx.js · MV_CD de systems/moves.js

  /** Vuela un misil de LA COLA. `mv` y `t0`: la pirueta que se lanza y cuando (null = ninguna).
   *  `lat` = el avion corriendose de costado a esa velocidad todo el tiempo. */
  function cola(mv, t0, lat = 0) {
    const b = { x: 0, y: 5, vx: lat, vy: 0, spd: 74, pz: PZ9, maniobra: false, tight: false };
    const m = A9.lanzarCola({ x: 15, y: 6.5, z: 10.5 }, b);
    const ev = [];
    let t = 0, mvT = -1;
    for (let i = 0; i < 1200 && m.fase !== 'impacto'; i++) {
      t += DT9; b.x += lat * DT9;
      if (mv && mvT < 0 && t >= t0 && t < t0 + DT9 * 1.5) mvT = 0;
      if (mvT >= 0) { mvT += DT9; if (mvT >= MV[mv].dur) mvT = -2; }
      b.maniobra = mvT >= 0;
      const e = A9.pasoAim9(m, DT9, b);
      if (e) ev.push({ e, t: +t.toFixed(3), z: m.z });
      if (e === 'fin') break;
    }
    return ev;
  }

  test('sidewinder de atras: si no haces nada, te alcanza — y avisa UNA vez antes', () => {
    const ev = cola(null);
    const zona = ev.filter(e => e.e === 'zona'), imp = ev.find(e => e.e === 'impacto');
    assert.ok(imp, 'sin maniobra tiene que pegar');
    assert.ok(Math.abs(imp.t - P9.COLA_T) < 0.05, `pega a los ${imp.t} s y el camino dura ${P9.COLA_T}`);
    assert.equal(zona.length, 1, 'la zona (el momento de quebrar) se avisa una sola vez');
    assert.ok(imp.t - zona[0].t > 0.9, `entre el aviso y el impacto tiene que haber tiempo de reaccionar (${(imp.t - zona[0].t).toFixed(2)} s)`);
  });

  test('sidewinder de atras: NO se lo saca corriendose — copia todo lo que hagas', () => {
    // el avion a fondo de costado (30 u/s, lo maximo que da el alabeo) no lo deja atras
    const ev = cola(null, 0, bVx(Math.PI / 3));
    assert.ok(ev.some(e => e.e === 'impacto'), 'corriendose de costado se escapaba: la maniobra sobraria');
  });

  test('sidewinder de atras: el tonel CERCA lo pierde, y sigue de largo hasta perderse', () => {
    const tZona = P9.COLA_T * P9.COLA_ZONA;
    for (const t0 of [tZona - MV.tonel.dur * 0.5, tZona + 0.2, P9.COLA_T - 0.2]) {
      const ev = cola('tonel', t0);
      assert.ok(ev.some(e => e.e === 'pierde'), `un tonel a los ${t0.toFixed(2)} s (zona desde ${tZona.toFixed(2)}) no lo perdio`);
      assert.ok(!ev.some(e => e.e === 'impacto'), `un tonel a los ${t0.toFixed(2)} s y te pego igual`);
      const fin = ev.find(e => e.e === 'fin');
      assert.ok(fin && fin.z > PZ9, 'perdido tiene que irse ADELANTE tuyo, no quedarse encima');
    }
  });

  test('sidewinder de atras: TODAS las piruetas del catalogo lo pierden en la zona', () => {
    // "si el avion hace UNA de las maniobras predefinidas" — cualquiera, no una lista
    const tZona = P9.COLA_T * P9.COLA_ZONA;
    for (const id of Object.keys(MV)) {
      const ev = cola(id, tZona + 0.1);
      assert.ok(ev.some(e => e.e === 'pierde'), `${id} en la zona no lo perdio`);
    }
  });

  test('sidewinder de atras: la maniobra temprana no sirve, pero el reintento tras el enfriamiento llega', () => {
    // el que entra en panico y tonelea apenas sale el misil: esa no cuenta (todavia corrige)…
    const temprano = cola('tonel', 0.1);
    assert.ok(temprano.some(e => e.e === 'impacto'), 'un tonel a los 0,1 s ya lo perdia: la zona no significa nada');
    // …pero si aprieta de nuevo apenas se le enfria la pirueta, todavia llega. Se mide el PEOR
    // caso: el tonel que termina justo en el borde de la zona, y el segundo recien despues del
    // enfriamiento. Si esto falla, apurarse te condena sin segunda oportunidad.
    const tZona = P9.COLA_T * P9.COLA_ZONA;
    const t0 = tZona - MV.tonel.dur - 0.02, t1 = t0 + MV.tonel.dur + CD9 + 0.02;
    assert.ok(t1 < P9.COLA_T, `el reintento (${t1.toFixed(2)} s) llega despues del impacto (${P9.COLA_T} s)`);
    assert.ok(cola('tonel', t1).some(e => e.e === 'pierde'), 'el reintento tras el enfriamiento no lo pierde');
  });

  /** Vuela uno de LA COLA con un piloto: `piloto(t)` dice hacia donde rola (-1/0/+1) y si quema
   *  poscombustion. El avion es el del ALABEO de core/physics.js, igual que el de frente. */
  function colaQuemando(piloto) {
    const b = { x: 0, y: 5, vx: 0, vy: 0, spd: 74, pz: PZ9, maniobra: false, tight: false, boost: false };
    const m = A9.lanzarCola({ x: 15, y: 6.5, z: 10.5 }, b);
    let t = 0, bank = 0;
    for (let i = 0; i < 1200; i++) {
      t += DT9;
      const p = piloto(t);
      bank = bStep(bank, p.dir, DT9); b.vx = bVx(bank); b.x += b.vx * DT9; b.boost = p.boost;
      const e = A9.pasoAim9(m, DT9, b);
      if (e === 'impacto' || e === 'pierde') return { e, t, porque: m.porque };
    }
    return { e: null };
  }
  /** Quebrar de lado a lado cada `per` s, desde `desde`. */
  const zig9 = (desde, per = 0.5) => t => (t < desde ? 0 : Math.floor((t - desde) / per) % 2 ? -1 : 1);

  test('sidewinder de atras: POSCOMBUSTION y quiebres bruscos lo atrasan hasta perderte', () => {
    // "si el avion aplica posquemado y realiza movimientos bruscos, el misil empieza a tener mas
    // delay y puede evitarse tambien" (el autor, 30/9). Empezando en el primer segundo y medio.
    for (const desde of [0, 1, 1.5]) {
      const r = colaQuemando(t => ({ dir: zig9(desde)(t), boost: t >= desde }));
      assert.equal(r.e, 'pierde', `quemando y quebrando desde los ${desde} s no lo saco (${r.e} a los ${r.t && r.t.toFixed(2)} s)`);
      assert.equal(r.porque, 'quemado', 'lo perdio, pero no por la poscombustion');
    }
  });

  test('sidewinder de atras: cada mitad SOLA no lo saca — y tarde, lo que queda es la maniobra', () => {
    const tarde = P9.COLA_T * P9.COLA_ZONA + 0.3;
    const casos = {
      'quemar derecho': () => ({ dir: 0, boost: true }),
      'quebrar sin poscombustion': t => ({ dir: zig9(0)(t), boost: false }),
      'deslizarse parejo quemando': () => ({ dir: 1, boost: true }),
      'una rafaga corta (0,6 s) y soltar': t => ({ dir: t < 0.6 ? zig9(0)(t) : 0, boost: t < 0.6 }),
      'empezar ya en la zona': t => ({ dir: zig9(tarde)(t), boost: t >= tarde }),
    };
    for (const [n, piloto] of Object.entries(casos)) assert.equal(colaQuemando(piloto).e, 'impacto', `${n} lo saco`);
  });

  test('sidewinder: si te alcanza, te ELIMINA en los tres modos (no es daño)', async () => {
    const D9 = await import('../src/core/damage.js');
    assert.ok(D9.isFatal('death_sidewinder'), 'volvio a la tabla de daño: "si el misil me impacta me elimina"');
    for (const modo of D9.DMG_MODES) assert.ok(D9.applyHit(100, 'death_sidewinder', modo).down, `en ${modo} no te elimina`);
  });

  /** Vuela uno DE FRENTE. `tr`: a los cuantos segundos del disparo el avion empieza a rolar. */
  function frente(zL, tr) {
    const b = { x: 0, y: 5, vx: 0, vy: 0, spd: 74, pz: PZ9, maniobra: false, tight: false };
    const m = A9.lanzarFrente({ x: 3, y: 20, z: zL }, b);
    let t = 0, bank = 0, maxC = 0;
    for (let i = 0; i < 600; i++) {
      t += DT9;
      bank = bStep(bank, tr !== null && t >= tr ? 1 : 0, DT9);
      b.vx = bVx(bank); b.x += b.vx * DT9;
      const e = A9.pasoAim9(m, DT9, b);
      maxC = Math.max(maxC, Math.abs(m.cx), Math.abs(m.cy));
      if (e === 'impacto' || e === 'cruza') return { e, t, maxC };
    }
    return { e: null };
  }

  test('sidewinder de frente: quieto te pega; corriendote a tiempo lo esquivas', () => {
    for (const zL of P9.FRENTE_Z) {
      assert.equal(frente(zL, null).e, 'impacto', `lanzado a ${zL}, un avion quieto tiene que recibirlo`);
      assert.equal(frente(zL, 0.3).e, 'cruza', `lanzado a ${zL}, rolar a los 0,3 s tiene que alcanzar`);
    }
  });

  test('sidewinder de frente: te sigue un poco pero NO gira bruscamente', () => {
    const r = frente(P9.FRENTE_Z[1], 0.3);
    assert.ok(r.maxC > 0.5, 'no corrige nada: no te "sigue"');
    assert.ok(r.maxC <= P9.FRENTE_LAT + 1e-9, `corrigio ${r.maxC.toFixed(2)} u/s y el tope es ${P9.FRENTE_LAT}`);
    assert.ok(P9.FRENTE_LAT < bVx(Math.PI / 3) * 0.5, 'si corrige casi tanto como vos te moves, de frente no se esquiva');
  });

  test('sidewinder: uno, o como mucho DOS por Harrier', () => {
    assert.ok(P9.POR_HARRIER >= 1 && P9.POR_HARRIER <= 2, `la cola carga ${P9.POR_HARRIER}`);
    const spawn = readFileSync(new URL('../src/systems/spawn.js', import.meta.url), 'utf8');
    assert.match(spawn, /aim9: Math\.random\(\) < AIM9\.FRENTE_P2 \? 2 : 1/, 'el caza de frente tiene que cargar 1 o 2');
    // y lo que se fue, no vuelve: ni rafagas que erran en la cola ni trazadoras en el caza de frente
    const caza = readFileSync(new URL('../src/systems/caza.js', import.meta.url), 'utf8');
    assert.ok(!/function rafaga\(/.test(caza), 'volvio la rafaga que erra en la cola');
    assert.ok(!/gun: 2/.test(spawn), 'volvieron las trazadoras del caza de frente');
  });
  // ---- VARIOS SIDEWINDER EN LA COLA (pedido del autor 1/10): las zonas y el choque entre ellos ----
  /** N misiles de cola, cada uno por su zona, avanzados hasta los avances `us` (sin maniobrar). */
  function salva(us) {
    const b = { x: 0, y: 20, vx: 0, vy: 0, spd: 110, pz: PZ9, maniobra: false, tight: false, boost: false };
    const ms = us.map((_, i) => A9.lanzarCola({ x: i % 2 ? 9 : -9, y: 19, z: 6 }, b, P9, { x: P9.ZONAS[i][0], y: P9.ZONAS[i][1] }));
    ms.forEach((m, i) => { for (let k = 0; k < 4000 && m.u < us[i]; k++) A9.pasoAim9(m, DT9, b); });
    return { b, ms };
  }

  test('varios sidewinder: cada uno viene por su zona y cierra hacia el centro', () => {
    const lejos = salva([0.15, 0.15, 0.15, 0.15]), cerca = salva([0.95, 0.95, 0.95, 0.95]);
    const d = (m, b) => Math.hypot(m.x - b.x, m.y - b.y);
    // lejos estan REPARTIDOS: a los dos lados, y arriba y abajo
    assert.ok(lejos.ms[0].x < lejos.b.x - 2 && lejos.ms[1].x > lejos.b.x + 2, 'los dos primeros tienen que venir uno por cada ala');
    assert.ok(lejos.ms[2].y > lejos.b.y + 2 && lejos.ms[3].y < lejos.b.y - 1, 'el tercero por arriba y el cuarto por abajo');
    // ...y cerca, todos encima
    for (let i = 0; i < 4; i++) assert.ok(d(cerca.ms[i], cerca.b) < d(lejos.ms[i], lejos.b) * 0.35,
      `el misil ${i} no cerro hacia el centro: ${d(lejos.ms[i], lejos.b).toFixed(1)} → ${d(cerca.ms[i], cerca.b).toFixed(1)}`);
  });

  test('varios sidewinder: una maniobra hace chocar a los que vienen cerca, detras y lejos del avion', () => {
    const { b, ms } = salva([0.7, 0.5, 0.2]);
    b.maniobra = true;
    const g = A9.quiebreGrupal(ms, b, P9);
    assert.equal(g.length, 2, 'chocan los dos que vienen cerca; el lejano (0.2) sigue viniendo');
    assert.equal(ms[2].fase, 'guia', 'el que venia lejos no entra al choque');
    const ev = [[], []];
    for (let k = 0; k < 400; k++) g.forEach((m, i) => { if (!m.done) { const e = A9.pasoAim9(m, DT9, b); if (e) ev[i].push(e); } });
    assert.deepEqual(ev, [['choca'], ['choca']], 'cada uno tiene que terminar en un choque, y nada mas');
    assert.ok(Math.hypot(g[0].x - g[1].x, g[0].y - g[1].y, g[0].z - g[1].z) < 0.01, 'tienen que encontrarse en el mismo punto');
    assert.ok(g[0].z < PZ9 - 3, 'el estallido tiene que quedar DETRAS del avion, y no pegado');
    assert.ok(Math.abs(g[0].x - b.x) > 5, '...y corrido de costado: no encima tuyo');
    assert.ok(g[0].tc <= P9.CHOQUE_T + DT9 * 1.5, 'tardaron mas que CHOQUE_T en juntarse');
  });

  test('varios sidewinder: sin maniobra, con uno solo cerca o con todos lejos, nadie choca', () => {
    let s1 = salva([0.7, 0.5]);
    assert.equal(A9.quiebreGrupal(s1.ms, s1.b, P9).length, 0, 'sin maniobra no puede haber choque');
    s1 = salva([0.7, 0.2]); s1.b.maniobra = true;
    assert.equal(A9.quiebreGrupal(s1.ms, s1.b, P9).length, 0, 'con UNO solo cerca no hay con quien chocar: ese sigue de largo');
    assert.equal(A9.pasoAim9(s1.ms[0], DT9, s1.b), 'pierde', 'el que estaba en la zona se pierde como siempre');
    s1 = salva([0.3, 0.2]); s1.b.maniobra = true;
    assert.equal(A9.quiebreGrupal(s1.ms, s1.b, P9).length, 0, 'si todos vienen lejos todavia, la maniobra es temprana y no sirve');
    s1 = salva([0.5, 0.45]); s1.b.maniobra = true;
    assert.equal(A9.quiebreGrupal(s1.ms, s1.b, P9).length, 2, 'con varios, el quiebre sirve a media distancia: es lo que deja que estallen lejos');
  });
}
