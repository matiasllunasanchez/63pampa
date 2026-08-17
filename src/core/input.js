// INPUT: el unico lugar que escucha teclado, mouse y tactil, y traduce todo a estado.
//
// El juego NO lee el DOM en ningun otro lado: lee estos objetos. Eso es lo que permite que el
// vuelo, el momentum y el HUD razonen sobre "el jugador esta girando / disparando" sin saber si
// vino de una flecha, un arrastre tactil o un stick.
//
// LO QUE EXPONE (estado, identidad estable — se muta, no se reasigna):
//   inp      controles de vuelo: l/r/u/d + fire/turbo/msl
//   mouse    la MIRA en PC (x,y en pantalla; `on` = mira LIBRE, se habilita con CAPS LOCK activa)
//   pointer  arrastre de vuelo tactil en `pointer.steer` (null o {x,y})
//   flags    pulsos de un frame: `anyPress` (hubo tecla/tap fresco) y `startReq` (pidieron jugar)
//
// LO QUE NO SABE: que hacen las cosas. Navegar el menu, confirmar el modo, cambiar el mapa,
// hacer un tonel, lanzar un misil, ciclar la camara — todo eso son ACCIONES del juego que se
// reciben como callbacks en initInput(). Asi el modulo de input no depende del motor: le avisa
// "el jugador confirmo" y el motor decide que significa. El estado de menu/camara vive en game.js.

import { S, cfg } from './state.js';
import { W, H } from '../render/ctx.js';
import { audio } from '../systems/audio.js';

// `brake` es el FRENO del ARENA (L2 en el mando; el teclado frena con [F], que llega por `sink`).
// Campo propio y no `sink` a secas para que L2 no mueva el paneo de camara del PASILLO.
export const inp = { l: 0, r: 0, u: 0, d: 0, rise: 0, sink: 0, brake: 0, fire: false, turbo: false, msl: false,
  // GIRO LIBRE del horizonte (eje X del stick DERECHO). Teclado: rollL/rollR (0 o 1). Joystick:
  // rollAx, analogico -1..1 → el mando rola mas rapido cuanto mas lo empujas.
  rollL: 0, rollR: 0, rollAx: 0,
  // PANEO DE CAMARA (eje Y del stick DERECHO): camU = mirar arriba, camD = mirar abajo.
  // camAx es la version analogica del mando (+1 = stick abajo = mirar abajo). Lo consume
  // systems/flight.js sumandolo al `camLift` de la camara.
  camU: 0, camD: 0, camAx: 0 };
export const mouse = { x: W / 2, y: H * 0.4, on: false };
export const pointer = { steer: null };   // arrastre de vuelo tactil (null fuera de arrastre)
export const flags = { anyPress: false, startReq: false };

// mapeo de las teclas de vuelo a los ejes de `inp`
const KEYMAP = {
  // W/A/S/D SON EL STICK IZQUIERDO, SIEMPRE. Es la mano que vuela y nunca cambia de trabajo:
  // W gas · S picada · A/D esquivar. Que no dependa de ninguna configuracion es el punto.
  KeyA: 'l', KeyD: 'r', KeyW: 'u', KeyS: 'd',
  // R/F: la CAMARA. En MODO CAMARA (cfg.devcam) la mueven libre por el mapa; en vuelo normal
  // panean un poco arriba/abajo, igual que el stick derecho vertical. Subir la camara y mirar
  // hacia abajo son la MISMA cosa (entra mas mundo por debajo), por eso `rise` cuenta como 'D'.
  KeyR: 'rise', KeyF: 'sink',
  // Q/E: rolar. Son el eje X del stick derecho y estan SIEMPRE, en los dos modos de mira — asi
  // que rolar nunca depende de una configuracion. Son ademas las de rolar en cualquier simulador.
  KeyQ: 'rollL', KeyE: 'rollR',
};

// LAS FLECHAS TIENEN DOS VIDAS, y cual esta activa la decide la MIRA (cfg.aim):
//
//   MIRA FIJA  → las dos manos estan en el teclado. WASD es el stick izquierdo y las FLECHAS son
//                el DERECHO: ←/→ rolan, ↑/↓ panean la camara. El mando entero, sin mando.
//   MIRA MOVIL → esa mano se fue al MOUSE a apuntar, y el stick derecho pasa a ser el mouse. Las
//                flechas quedan sin dueño, asi que vuelven a volar como siempre (el que jugaba con
//                flechas sigue jugando igual). Lo del stick derecho que el mouse no cubre —rolar y
//                panear— queda en Q/E y R/F, al alcance de la mano que quedo en el teclado.
//
// Es la razon por la que esto no es una opcion aparte: la mira ya dice cuantas manos hay libres.
const ARROW_FLY = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd' };
const ARROW_STICK = { ArrowLeft: 'rollL', ArrowRight: 'rollR', ArrowUp: 'camU', ArrowDown: 'camD' };
// EJE Y UNIFICADO (cfg.invY). Se da vuelta ACA, donde la tecla y el stick se traducen a `inp`, y
// NO en cada modo. Es la diferencia entre "todos los modos usan el mismo eje" y "cada modo se
// acuerda de invertirlo": el pasillo, el arena, la pasada y la barcaza leen todos `inp.u`, asi que
// por construccion no pueden decir cosas distintas. Antes el arena y la pasada se lo invertian
// solas con `cfg.arenaInv` y el pasillo no — y eso era exactamente el bug.
const vyField = f => cfg.invY && (f === 'u' || f === 'd') ? (f === 'u' ? 'd' : 'u') : f;
const keyField = c => vyField(KEYMAP[c] !== undefined ? KEYMAP[c] : (cfg.aim ? ARROW_FLY : ARROW_STICK)[c]);

// TOKENS DEL DETECTOR DE COMBOS. Minusculas = stick IZQUIERDO (volar), mayusculas = stick DERECHO.
// La distincion es lo que permite que una secuencia diga con QUE mano se hace: los rolidos piden
// mayusculas y los zigzag minusculas (ver la tabla de `combo` en game.js).
const TAPTOK = { l: 'l', r: 'r', u: 'u', d: 'd', rollL: 'L', rollR: 'R', camU: 'U', camD: 'D',
  rise: 'D', sink: 'U' };
const isConfirm = c => c === 'Enter' || c === 'Space' || c === 'KeyX' || c === 'KeyK';
const isBack = c => c === 'Escape' || c === 'Backspace';
const isFire = c => c === 'KeyX' || c === 'KeyK' || c === 'Space';
const isTurbo = c => c === 'ShiftLeft' || c === 'ShiftRight' || c === 'KeyC';
const isLeft = c => c === 'ArrowLeft' || c === 'KeyA';
const isRight = c => c === 'ArrowRight' || c === 'KeyD';
const isUp = c => c === 'ArrowUp' || c === 'KeyW';
const isDown = c => c === 'ArrowDown' || c === 'KeyS';

/** Instala todos los listeners. `cv` es el canvas; `a` es el objeto de acciones (callbacks). */
export function initInput(cv, a) {
  // COMBOS DE PIRUETAS: secuencias de toques direccionales (l/r/u/d) encadenados. El detector es
  // UNO solo para teclado y joystick: guarda los ultimos toques FRESCOS en un buffer y le pasa la
  // secuencia a game.js, que decide que maniobra es — aca no se sabe de maniobras.
  //
  // COINCIDENCIA POR SUFIJO MAS LARGO. Hay secuencias de 3 y 4 toques (el buffer aguanta 5), y las
  // largas TERMINAN en tramos que podrian ser otra secuencia. Se prueba de la mas larga a la mas
  // corta, asi la mas especifica gana; sin esto la corta dispararia antes y las largas serian
  // inalcanzables.
  //
  // El requisito que hace que esto funcione es de DISEÑO, no de codigo: ningun prefijo de una
  // secuencia larga puede ser, el mismo, un combo. Si '↓←' disparara algo, el circulo que empieza
  // con '↓←' nunca llegaria al cuarto toque. Ver la tabla en game.js.
  //
  // Dispara AL INSTANTE en cuanto hay coincidencia: esperar a ver si viene otro toque agregaria
  // latencia a TODAS las maniobras, y son de esquive — 100 ms es la diferencia entre pasar y chocar.
  const taps = [];
  const COMBO_WIN = 0.28, COMBO_MAX = 5;
  function dirTap(d) {
    const now = performance.now() / 1000;
    // un hueco largo CORTA la secuencia: lo de antes ya no es parte de este combo
    if (taps.length && now - taps[taps.length - 1].t > COMBO_WIN) taps.length = 0;
    taps.push({ d, t: now });
    if (taps.length > COMBO_MAX) taps.shift();
    if (S.state !== 'play') return;
    for (let n = taps.length; n >= 2; n--) {
      if (a.combo(taps.slice(-n).map(x => x.d).join(''))) { taps.length = 0; return; }
    }
  }
  let steerPtr = null;                   // el puntero que esta arrastrando el vuelo
  const zonePtr = new Map();             // punteros tactiles → zona ('fire' / 'turbo')

  function canvasPos(e) {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }

  addEventListener('keydown', e => {
    audio();
    readCaps(e);                                                          // CAPS LOCK gobierna la mira
    // PAUSA: mientras esta abierta se come TODO el teclado (navegar/confirmar/volver) — asi las
    // flechas no alimentan el vuelo ni el detector de combos con el juego congelado.
    if (a.isPaused()) {
      if (e.repeat) { e.preventDefault(); return; }
      if (isUp(e.code)) a.pauseNav(-1);
      else if (isDown(e.code)) a.pauseNav(1);
      else if (isConfirm(e.code)) a.pauseConfirm();
      else if (isBack(e.code)) a.pauseBack();
      e.preventDefault(); return;
    }
    // ESC en pleno juego = PAUSA (en MODO CAMARA no: ahi Escape ya significa salir, ver abajo)
    if (!e.repeat && isBack(e.code) && !cfg.devcam
      && (S.state === 'play' || S.state === 'takeoff' || S.state === 'momentum' || S.state === 'arena')) {
      a.pauseToggle(); e.preventDefault(); return;
    }
    if (S.state === 'title') { a.startTitle(); e.preventDefault(); return; }   // PORTADA: cualquier tecla
    if (S.state === 'options') {                                          // OPCIONES: lista de ajustes
      if (isUp(e.code)) { a.optNav(-1); e.preventDefault(); return; }
      if (isDown(e.code)) { a.optNav(1); e.preventDefault(); return; }
      if (isLeft(e.code)) { a.optChange(-1); e.preventDefault(); return; }
      if (isRight(e.code)) { a.optChange(1); e.preventDefault(); return; }
      // ENTER dejo de significar SALIR: hay filas que ABREN una sub-pantalla (MEJORAS DEL PICHON).
      // Si no abre nada, optConfirm() sale igual que antes, asi que no cambia el habito.
      if (isConfirm(e.code)) { a.optConfirm(); e.preventDefault(); return; }
      if (isBack(e.code)) { a.escToMenu(); e.preventDefault(); return; }
      return;
    }
    // MEJORAS DEL PICHON: la sub-pantalla de OPCIONES con todo lo que toca al avion. ENTER acá
    // ALTERNA la fila (es un interruptor, no una confirmacion) y ESC es la unica salida — que es
    // lo que dice el pie de la pantalla.
    if (S.state === 'mejoras') {
      if (isUp(e.code)) { a.mejNav(-1); e.preventDefault(); return; }
      if (isDown(e.code)) { a.mejNav(1); e.preventDefault(); return; }
      if (isLeft(e.code)) { a.mejChange(-1); e.preventDefault(); return; }
      if (isRight(e.code) || isConfirm(e.code)) { a.mejChange(1); e.preventDefault(); return; }
      if (isBack(e.code)) { a.mejBack(); e.preventDefault(); return; }
      return;
    }
    if (S.state === 'modeselect') {                                       // CAMPAÑA / CICLO / SUPERVIVENCIA
      if (isUp(e.code) || isLeft(e.code)) { a.modeNav(-1); e.preventDefault(); return; }
      if (isDown(e.code) || isRight(e.code)) { a.modeNav(1); e.preventDefault(); return; }
      if (isConfirm(e.code)) { a.confirm(); e.preventDefault(); return; }
      return;
    }
    if (S.state === 'dead') {                                             // DERRIBADO: Esc vuelve al menu
      if (isBack(e.code)) { a.escToMenu(); e.preventDefault(); return; }
    }
    // seleccion de avion. El menu de mapa [M] ya no existe: toda la configuracion vive en
    // OPCIONES, que se alcanza desde el menu de modos y por lo tanto tambien desde la campaña.
    if (S.state === 'menu') {
      if (isBack(e.code)) { a.escToMenu(); e.preventDefault(); return; }
      if (isLeft(e.code)) { a.planeNav(-1); e.preventDefault(); return; }
      if (isRight(e.code)) { a.planeNav(1); e.preventDefault(); return; }
      if (isConfirm(e.code)) { flags.startReq = true; e.preventDefault(); return; }
    }
    if (S.state === 'story') {                                           // HISTORIA: Esc vuelve al menu
      if (isBack(e.code)) { a.escToMenu(); e.preventDefault(); return; }
    }
    if (S.state === 'campmenu') {                                        // submenu de HISTORIA
      if (isUp(e.code)) { a.campNav(-1); e.preventDefault(); return; }
      if (isDown(e.code)) { a.campNav(1); e.preventDefault(); return; }
      if (isConfirm(e.code)) { a.campConfirm(); e.preventDefault(); return; }
      if (isBack(e.code)) { a.escToMenu(); e.preventDefault(); return; }
      return;
    }
    if (S.state === 'quickmenu') {                                       // submenu de JUEGO RAPIDO
      if (isUp(e.code)) { a.quickNav(-1); e.preventDefault(); return; }
      if (isDown(e.code)) { a.quickNav(1); e.preventDefault(); return; }
      if (isConfirm(e.code)) { a.quickConfirm(); e.preventDefault(); return; }
      if (isBack(e.code)) { a.escToMenu(); e.preventDefault(); return; }
      return;
    }
    if (S.state === 'saves') {                                           // partidas guardadas (cargar)
      if (isUp(e.code)) { a.savesNav(-1); e.preventDefault(); return; }
      if (isDown(e.code)) { a.savesNav(1); e.preventDefault(); return; }
      if (isConfirm(e.code)) { a.savesConfirm(); e.preventDefault(); return; }
      if (isBack(e.code)) { a.savesBack(); e.preventDefault(); return; }
      return;
    }
    if (S.state === 'upgrade') {                                         // EL BANCO DEL PICHON: elegir UNA mejora
      if (isUp(e.code) || isLeft(e.code)) { a.upgNav(-1); e.preventDefault(); return; }
      if (isDown(e.code) || isRight(e.code)) { a.upgNav(1); e.preventDefault(); return; }
      if (isConfirm(e.code)) { a.upgConfirm(); e.preventDefault(); return; }
      return;                                                            // sin ESC: la mejora se elige si o si
    }
    // MODO CAMARA: la partida no termina nunca sola (avion inmortal) — se sale con ESCAPE.
    // Solo en ese modo: en el PASILLO normal Escape sigue sin hacer nada durante el vuelo.
    if (S.state === 'play' && cfg.devcam && isBack(e.code)) { a.escToMenu(); e.preventDefault(); return; }
    // PIRUETAS: cada toque fresco alimenta el detector de combos (ver dirTap). Sale del CAMPO que
    // la tecla escribe, no de la tecla: asi A/D dan 'l'/'r' o 'L'/'R' segun en que vida esten.
    const kf = keyField(e.code);
    if (!e.repeat && S.state === 'play' && TAPTOK[kf]) dirTap(TAPTOK[kf]);
    // EL PULSO lee los MISMOS toques que el detector de combos, pero no pasa por el: la prueba
    // no dispara piruetas, las DELETREA. Mismo vocabulario, otro consumidor.
    if (!e.repeat && S.state === 'pulso' && TAPTOK[kf]) a.pulsoTap(TAPTOK[kf]);
    // anyPress solo con pulsaciones FRESCAS (!e.repeat): el auto-repeat de una tecla sostenida no
    // debe saltear pantallas (historia, derribado, transiciones). inp si se re-setea siempre.
    if (kf !== undefined) { inp[kf] = 1; if (!e.repeat) flags.anyPress = true; e.preventDefault(); }
    if (isFire(e.code)) { inp.fire = true; if (!e.repeat) flags.anyPress = true; e.preventDefault(); }
    if (isTurbo(e.code)) { inp.turbo = true; if (!e.repeat) flags.anyPress = true; }
    if (e.code === 'KeyV' && !e.repeat) a.cycleCamera();                 // cicla las 4 camaras
    // VIRAJE DE COMBATE del ARENA (media vuelta guionada, PLAN_MINUTOS_SAGRADOS E3). [R] esta
    // libre ahi: `rise` es el paneo de camara del PASILLO y el arena no lo lee. Tecla propia y no
    // un combo de dos toques a proposito — el repo ya aprendio que con dos toques las maniobras
    // salen solas maniobrando (ver el encabezado de data/moves.js).
    if (e.code === 'KeyR' && !e.repeat) a.combatTurn();
    // REPARTO DE ENERGIA del ARENA (S1). [G] libre en todo el juego; [TAB] NO servia (es misil).
    if (e.code === 'KeyG' && !e.repeat) a.cyclePip();
    if (e.code === 'KeyZ' || e.code === 'Tab') { inp.msl = true; if (!e.repeat) flags.anyPress = true; e.preventDefault(); }   // misil (Z o TAB)
    if (!e.repeat && S.state === 'pulso' && e.code === 'KeyZ') a.pulsoTap('Z');   // el remate: la suelta
    if (e.code === 'Enter' && !e.repeat) flags.anyPress = true;
    // MUSICA: tecla 1 = pista anterior, tecla 2 = siguiente (el motor lo ignora fuera de modo)
    if (!e.repeat && (e.code === 'Digit1' || e.code === 'Numpad1')) a.trackPrev();
    if (!e.repeat && (e.code === 'Digit2' || e.code === 'Numpad2')) a.trackNext();
    if (!e.repeat && (e.code === 'Digit4' || e.code === 'Numpad4')) a.tempoToggle();   // MOMENTUM: camara lenta (pasillo)
  });
  addEventListener('keyup', e => {
    readCaps(e);
    if (KEYMAP[e.code] !== undefined) inp[vyField(KEYMAP[e.code])] = 0;
    // las FLECHAS se sueltan en SUS DOS VIDAS. Si la mira cambia con la tecla apretada, el keyup
    // llegaria con la otra vida activa y el campo viejo quedaria clavado en 1 — el avion doblando solo.
    if (ARROW_FLY[e.code]) { inp[ARROW_FLY[e.code]] = 0; inp[ARROW_STICK[e.code]] = 0; }
    // LOS VERTICALES SE SUELTAN LOS DOS, por la misma razon que las flechas: si el eje se invierte
    // (△) con la tecla apretada, el keydown escribio un campo y el keyup limpiaria el otro.
    if (KEYMAP[e.code] === 'u' || KEYMAP[e.code] === 'd') { inp.u = 0; inp.d = 0; }
    if (isFire(e.code)) inp.fire = false;
    if (isTurbo(e.code)) inp.turbo = false;
    if (e.code === 'KeyZ' || e.code === 'Tab') inp.msl = false;
  });

  // tactil: arrastre a la izquierda = volar; derecha arriba = fuego; derecha abajo = turbo
  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); cv.focus(); audio(); flags.anyPress = true;
    const p = canvasPos(e);
    if (S.state === 'title') { a.startTitle(); return; }                 // PORTADA: cualquier tap
    // se pasa la Y CRUDA: la fila la resuelve game.js con la geometria real del menu
    if (S.state === 'modeselect') { a.modeSelect(p.y); return; }
    if (S.state === 'menu') {
      if (p.x < W * 0.28) a.planeNav(-1);
      else if (p.x > W * 0.72) a.planeNav(1);
      else flags.startReq = true;
      return;
    }
    // PC (mouse): click izq = canon sostenido, click der = misil — en juego y momentum
    if (e.pointerType === 'mouse' && (S.state === 'play' || S.state === 'momentum' || S.state === 'arena')) {
      if (e.button === 2) a.launchMissile();
      else { zonePtr.set(e.pointerId, 'fire'); inp.fire = true; }
      return;
    }
    if (p.x < W * 0.62) { steerPtr = e.pointerId; pointer.steer = p; }
    else {
      const z = p.y < H / 2 ? 'fire' : 'turbo';
      zonePtr.set(e.pointerId, z); inp[z] = true;
    }
  });
  cv.addEventListener('pointermove', e => {
    // OJO: NO se llama a readCaps aca. Los eventos de puntero no traen el estado de CAPS LOCK, asi
    // que preguntarselo daba siempre "apagada" y la mira se daba vuelta en cada movimiento del
    // mouse. Ver el comentario de readCaps.
    // el mouse mueve la mira solo con MIRA MOVIL (cfg.aim); con FIJA, readCaps ya la clavo al centro
    if (e.pointerType === 'mouse') { const p = canvasPos(e); mouse.x = p.x; mouse.y = p.y; if (cfg.aim) mouse.on = true; }
    if (e.pointerId === steerPtr) pointer.steer = canvasPos(e);
  });
  cv.addEventListener('contextmenu', e => e.preventDefault());          // click derecho = misil, sin menu
  function ptrEnd(e) {
    if (e.pointerId === steerPtr) { steerPtr = null; pointer.steer = null; }
    const z = zonePtr.get(e.pointerId);
    if (z) { zonePtr.delete(e.pointerId); if (![...zonePtr.values()].includes(z)) inp[z] = false; }
  }
  cv.addEventListener('pointerup', ptrEnd);
  cv.addEventListener('pointercancel', ptrEnd);

  // ---------- JOYSTICK (USB / Bluetooth, Gamepad API mapeo estandar, botones estilo PlayStation) ----------
  // Se puede JUGAR entero con el joystick. Mapeo (botones estilo PlayStation; ✕=0 ◯=1 □=2 △=3):
  //   Stick izq izq/der          esquivar
  //   Stick izq VERTICAL         throttle: ARRIBA sube (gas) · ABAJO baja (picada)
  //   Stick der HORIZONTAL       GIRO LIBRE del horizonte (= [Q]/[E]); analogico
  //   Stick der VERTICAL         PANEO DE CAMARA arriba/abajo (= [R]/[F]); analogico
  //   R1 (5)                     METRALLETA        L1 (4)             MISIL
  //   gatillo (7)                turbo             △ Triangle (3)     invertir el gas
  //   ✕ Cross (0)                metralleta tambien (y OK / avanzar en menus)
  //   □ Square (2)               misil tambien     ◯ Circle (1)       atras (volver)
  //   L2 (6)                     freno (arena y pasada)
  //   cruceta ↑ (12)             reparto de energia (arena)
  //   cruceta ↓ (13)             camara: cabina ↔ tercera persona (= [V])
  //   L3 (10) / R3 (11)          pista musical ◄ / ►     cruceta ←/→   esquivar (y navegar menus)
  //
  // EN LA PASADA el mando NO cambia de significado, y es a proposito: L1/□ —el boton del misil—
  // SUELTA LA RISTRA DE BOMBAS. Es el mismo campo (`inp.msl`) que lee el pasillo para el misil, asi
  // que "el otro indice tira lo pesado" vale en los tres modos y no hay una mano nueva que aprender.
  //
  // R1/L1 son las ARMAS porque es donde estan en cualquier juego de vuelo: el indice dispara y el
  // otro indice suelta el misil, sin soltar los pulgares de los sticks. ✕ y □ quedan como alias —
  // ✕ ya era el boton de OK, sacarle el cañon obligaria a re-aprender la mano entera.
  //
  // Con mando la MIRA es SIEMPRE FIJA: no hay con que moverla, y es a proposito. Fija/movil se
  // elige en OPCIONES (cfg.aim) y en teclado lo alterna CAPS LOCK.
  //
  // El vuelo se ESCRIBE en `inp` solo mientras el pad lo pisa (setPad limpia al soltar), asi
  // convive con el teclado sin pisarlo. La navegacion de menus y las acciones (tonel, camara,
  // pista) van por FLANCO (una pulsacion = una accion), igual que el teclado.
  const AX_DZ = 0.35;                          // zona muerta de los sticks (vuelo/menus)
  const padHeld = { l: 0, r: 0, u: 0, d: 0, fire: false, turbo: false, msl: false, rollAx: 0, camAx: 0 };
  const rPrev = { L: 0, R: 0, U: 0, D: 0 };    // stick DERECHO: flanco de cada direccion (combos)
  let btnPrev = [];                            // estado previo de botones (flanco)
  let padLast = performance.now();             // para el dt del movimiento fluido de la mira
  let capsPrev = null;
  const nav = { u: false, d: false, l: false, r: false };   // navegacion previa (cruceta+stick)

  // CAPS LOCK gobierna la mira: activa = MOVIL (la mueve el mouse), inactiva = FIJA.
  //
  // DOS REGLAS, Y LAS DOS SON CICATRICES:
  //
  // 1. SOLO SE LEE DE EVENTOS DE TECLADO. Los de puntero NO traen el modificador — medido: con
  //    CAPS activa, keydown reporta true y pointermove reporta false. Leyendolo de los dos, cada
  //    vez que la fuente alternaba parecia un cambio de CAPS: moviendo el mouse mientras volas
  //    (que es todo el tiempo) la mira se daba vuelta en CADA evento y el cartel salia sin parar.
  //
  // 2. SE APLICA EL ESTADO, NO UN TOGGLE. Antes esto invertia cfg.aim en cada flanco, asi que el
  //    valor podia quedar al reves del que dice la luz de la tecla y ya no habia forma de saber
  //    que iba a hacer la proxima pulsacion. Ahora CAPS *es* el modo: prendida movil, apagada
  //    fija. Es auto-corrector — no puede desincronizarse.
  //
  // Que se aplique solo cuando CAMBIA es lo que deja convivir a OPCIONES: entre cambios de CAPS,
  // el valor lo manda la fila de OPCIONES, y las dos vias escriben el mismo cfg.aim.
  function readCaps(e) {
    if (!e.getModifierState) return;
    const now = e.getModifierState('CapsLock');
    const want = now ? 1 : 0;
    if (capsPrev !== null && now !== capsPrev && cfg.aim !== want) { cfg.aim = want; a.aimChanged(cfg.aim); }
    capsPrev = now;
    if (!cfg.aim) mouse.on = false;             // MIRA FIJA: el mouse no la despega del centro
  }

  // escribe un control de vuelo del pad en `inp`, y lo LIMPIA al soltar — sin pisar al teclado
  function setPad(f, v) { if (v || padHeld[f]) inp[f] = v; padHeld[f] = v; }

  function pollGamepad() {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()] : [];
    const gp = pads.find(g => g && g.connected);
    if (!gp) { btnPrev = []; padLast = performance.now(); requestAnimationFrame(pollGamepad); return; }
    const now = performance.now();
    const dt = Math.min(0.05, (now - padLast) / 1000);   // para el movimiento fluido de la mira
    padLast = now;

    const pressed = gp.buttons.map(b => b.pressed);
    const down = i => pressed[i];
    const hit = i => pressed[i] && !btnPrev[i];                 // flanco de subida
    const ax = i => { const v = gp.axes[i] || 0; return Math.abs(v) < AX_DZ ? 0 : v; };
    // primera pulsacion del pad: DESBLOQUEA el audio (el navegador no lo hace con el gamepad, solo
    // con teclado/mouse/tactil → sin esto, jugando SOLO con joystick no sonaba la metralla ni la musica)
    if (pressed.some((p, i) => p && !btnPrev[i])) { audio(); flags.anyPress = true; }

    // musica (en cualquier pantalla)
    if (hit(10)) a.trackPrev();
    if (hit(11)) a.trackNext();

    // QUE ESTADOS SON "JUGAR". Cada climax nuevo tiene que entrar aca o el mando deja de volar al
    // llegar: el `else` de abajo SUELTA todos los ejes (es la rama de menus). La PASADA se agrego
    // por eso — se entra sin corte desde el pasillo y el joystick se quedaba muerto en el aire.
    const inGame = S.state === 'play' || S.state === 'takeoff' || S.state === 'momentum'
      || S.state === 'arena' || S.state === 'pasada';
    // PAUSA con el mando: Start (9) la abre en juego; abierta, la cruceta/stick navegan,
    // ✕ confirma, ◯ vuelve y Start reanuda. El vuelo se SUELTA (setPad 0) para que al reanudar
    // no quede un eje clavado del frame anterior.
    if (inGame && a.isPaused()) {
      for (const f of ['l', 'r', 'u', 'd', 'fire', 'turbo', 'msl', 'brake', 'rollAx', 'camAx']) setPad(f, 0);
      const nu = down(12) || ax(1) < -0.5, nd = down(13) || ax(1) > 0.5;
      if (nu && !nav.u) a.pauseNav(-1);
      if (nd && !nav.d) a.pauseNav(1);
      if (hit(0)) a.pauseConfirm();
      if (hit(1)) a.pauseBack();
      if (hit(9)) a.pauseToggle();
      nav.u = nu; nav.d = nd;
      btnPrev = pressed;
      requestAnimationFrame(pollGamepad);
      return;
    }
    if (inGame && hit(9) && !cfg.devcam) a.pauseToggle();
    if (inGame) {
      const lx = ax(0), ly = ax(1);
      // COMBOS con el pad: el FLANCO de cada direccion (stick cruzando la zona muerta, o la
      // cruceta) cuenta como un toque — doble flick del stick = doble tap. Mismo detector.
      const dl = (lx < 0 || down(14)) ? 1 : 0, dr = (lx > 0 || down(15)) ? 1 : 0;
      const du = (cfg.invY ? ly > 0 : ly < 0) ? 1 : 0, dd = (cfg.invY ? ly < 0 : ly > 0) ? 1 : 0;
      if (S.state === 'play') {
        if (dl && !padHeld.l) dirTap('l');
        if (dr && !padHeld.r) dirTap('r');
        if (du && !padHeld.u) dirTap('u');
        if (dd && !padHeld.d) dirTap('d');
      }
      setPad('l', (lx < 0 || down(14)) ? 1 : 0);               // stick izq / cruceta izq = esquivar
      setPad('r', (lx > 0 || down(15)) ? 1 : 0);
      // STICK IZQUIERDO, EJE VERTICAL: ARRIBA SUBE, lo mismo que la W del teclado. `ly < 0` es el
      // stick arriba en el mapeo estandar, y va a 'u' — el mismo campo que escribe la W, asi que
      // las dos entradas no pueden divergir por construccion.
      // Con el stick centrado NO hay gas → el avion cae (mecanica central del juego).
      // cfg.invY lo da vuelta para quien lo prefiera (o para un mando que reporte al reves) — y da
      // vuelta el teclado CON EL, porque es un solo eje: △ lo alterna en vivo y la fila EJE Y lo guarda.
      if (hit(3)) a.throttleInvert();                          // △ = invertir el eje Y (y lo GUARDA)
      if (hit(1)) a.combatTurn();                              // ◯ = viraje de combate (solo lo lee el ARENA)
      // CRUCETA ARRIBA = reparto de energia. SQUADRONS_UPDATE §6 la daba por ocupada ("la cruceta
      // es esquive"), pero eso vale para 14/15 (izq/der): 12/13 no las lee nadie en juego.
      if (hit(12)) a.cyclePip();
      // CRUCETA ABAJO = CAMARA (lo mismo que [V]). Era la ultima direccion de la cruceta sin dueño
      // en juego, y hacia falta: en el ARENA y en la PASADA esa tecla conmuta CABINA ↔ TERCERA
      // PERSONA en vivo, y con el mando no habia forma de cambiar de vista.
      if (hit(13)) a.cycleCamera();
      setPad('u', du);                                         // potencia (gas / subir) — default: ARRIBA SUBE
      setPad('d', dd);                                         // picada (bajar)
      setPad('fire', down(5) || down(0));                      // R1 = metralleta (✕ tambien)
      setPad('turbo', down(7));                                // turbo (gatillo)
      setPad('msl', down(4) || down(2));                       // L1 = misil (□ tambien)
      setPad('brake', down(6) ? 1 : 0);                        // L2 = freno (solo lo lee el ARENA)

      // ---- STICK DERECHO ----
      // X = GIRO LIBRE DEL HORIZONTE (lo que en teclado son [Q]/[E]).
      // Y = PANEO DE CAMARA arriba/abajo (lo que en teclado son [R]/[F]).
      //
      // Antes este stick movia la MIRA, con R1 alternando fija/libre. Se saco: con el mando la
      // mira es SIEMPRE FIJA. Apuntar con stick nunca compitio con el mouse, y a cambio dejaba el
      // unico par de ejes analogicos libres del mando ocupado en algo que el juego ya resuelve solo.
      //
      // Son ANALOGICOS: el eje entra tal cual (-1..1) en vez de recortado a ±1, asi el mando rola
      // y panea mas rapido cuanto mas lo empujas — algo que el teclado no puede dar.
      const rx = ax(2), ry = ax(3);
      setPad('rollAx', rx);
      setPad('camAx', ry);
      // Y ADEMAS DAN TOQUES: cada cruce de la zona muerta es un tap en MAYUSCULA para el detector
      // de combos. Es lo que hace que las maniobras que ROLAN se pidan con la mano que rola.
      if (S.state === 'play') {
        const rNow = { L: rx < 0 ? 1 : 0, R: rx > 0 ? 1 : 0, U: ry < 0 ? 1 : 0, D: ry > 0 ? 1 : 0 };
        for (const k in rNow) { if (rNow[k] && !rPrev[k]) dirTap(k); rPrev[k] = rNow[k]; }
      }
    } else {
      for (const f of ['l', 'r', 'u', 'd', 'fire', 'turbo', 'msl', 'brake', 'rollAx', 'camAx']) setPad(f, 0);   // soltar el vuelo
      rPrev.L = rPrev.R = rPrev.U = rPrev.D = 0;   // volver a jugar con el stick sostenido = un toque nuevo
      // navegacion de menus por FLANCO (cruceta o stick)
      const nu = down(12) || ax(1) < -0.5, nd = down(13) || ax(1) > 0.5;
      const nl = down(14) || ax(0) < -0.5, nr = down(15) || ax(0) > 0.5;
      const confirm = hit(0) || hit(9);                        // A / Start
      if (S.state === 'title') {
        if (confirm || hit(1)) a.startTitle();
      } else if (S.state === 'modeselect') {
        if ((nu && !nav.u) || (nl && !nav.l)) a.modeNav(-1);
        if ((nd && !nav.d) || (nr && !nav.r)) a.modeNav(1);
        if (confirm) a.confirm();
      } else if (S.state === 'campmenu') {
        if (nu && !nav.u) a.campNav(-1);
        if (nd && !nav.d) a.campNav(1);
        if (confirm) a.campConfirm();
        if (hit(1)) a.escToMenu();                             // B = volver al selector de modos
      } else if (S.state === 'quickmenu') {
        if (nu && !nav.u) a.quickNav(-1);
        if (nd && !nav.d) a.quickNav(1);
        if (confirm) a.quickConfirm();
        if (hit(1)) a.escToMenu();                             // B = volver al selector de modos
      } else if (S.state === 'saves') {
        if (nu && !nav.u) a.savesNav(-1);
        if (nd && !nav.d) a.savesNav(1);
        if (confirm) a.savesConfirm();
        if (hit(1)) a.savesBack();
      } else if (S.state === 'upgrade') {
        if ((nu && !nav.u) || (nl && !nav.l)) a.upgNav(-1);
        if ((nd && !nav.d) || (nr && !nav.r)) a.upgNav(1);
        if (confirm) a.upgConfirm();
      } else if (S.state === 'menu') {
        if (nl && !nav.l) a.planeNav(-1);
        if (nr && !nav.r) a.planeNav(1);
        if (confirm) flags.startReq = true;
        if (hit(1)) a.escToMenu();                             // B = volver
      } else if (S.state === 'options') {
        // OPCIONES es la UNICA pantalla de configuracion desde que [M] dejo de existir, asi que
        // sin esto el joystick no podia tocar nada: arriba/abajo elige fila, izq/der cambia.
        if (nu && !nav.u) a.optNav(-1);
        if (nd && !nav.d) a.optNav(1);
        if (nl && !nav.l) a.optChange(-1);
        if (nr && !nav.r) a.optChange(1);
        if (confirm) a.optConfirm();                           // puede ABRIR una sub-pantalla
        if (hit(1)) a.escToMenu();                             // B = volver
      } else if (S.state === 'mejoras') {
        if (nu && !nav.u) a.mejNav(-1);
        if (nd && !nav.d) a.mejNav(1);
        if (nl && !nav.l) a.mejChange(-1);
        if ((nr && !nav.r) || confirm) a.mejChange(1);
        if (hit(1)) a.mejBack();                               // B = volver a OPCIONES
      }
      // el resto de pantallas (historia, derribado, recuento, victoria) avanzan con anyPress
      nav.u = nu; nav.d = nd; nav.l = nl; nav.r = nr;
    }
    btnPrev = pressed;
    requestAnimationFrame(pollGamepad);
  }
  requestAnimationFrame(pollGamepad);
}
