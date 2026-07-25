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

import { S } from './state.js';
import { W, H } from '../render/ctx.js';
import { audio } from '../systems/audio.js';
import { cycleLang } from './i18n.js';

export const inp = { l: 0, r: 0, u: 0, d: 0, fire: false, turbo: false, msl: false };
export const mouse = { x: W / 2, y: H * 0.4, on: false };
export const pointer = { steer: null };   // arrastre de vuelo tactil (null fuera de arrastre)
export const flags = { anyPress: false, startReq: false };

// mapeo de las teclas de vuelo a los ejes de `inp`
const KEYMAP = {
  ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r',
  ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd',
};
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
  let tapL = -9, tapR = -9;              // PIRUETA (tonel): doble-tap ← / → en vuelo
  let steerPtr = null;                   // el puntero que esta arrastrando el vuelo
  const zonePtr = new Map();             // punteros tactiles → zona ('fire' / 'turbo')

  function canvasPos(e) {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }

  addEventListener('keydown', e => {
    audio();
    readCaps(e);                                                          // CAPS LOCK gobierna la mira
    if (e.code === 'KeyL') { cycleLang(); e.preventDefault(); return; }   // cambia idioma sin empezar
    if (S.state === 'modeselect') {                                       // CAMPAÑA / CICLO / SUPERVIVENCIA
      if (isUp(e.code) || isLeft(e.code)) { a.modeNav(-1); e.preventDefault(); return; }
      if (isDown(e.code) || isRight(e.code)) { a.modeNav(1); e.preventDefault(); return; }
      if (isConfirm(e.code)) { a.confirm(); e.preventDefault(); return; }
      return;
    }
    if (S.state === 'dead') {                                             // DERRIBADO: Esc vuelve al menu
      if (isBack(e.code)) { a.escToMenu(); e.preventDefault(); return; }
    }
    if (S.state === 'menu') {                                             // seleccion de avion (supervivencia)
      if (isBack(e.code)) { a.escToMenu(); e.preventDefault(); return; }
      if (e.code === 'KeyM') { a.toggleCfg(); e.preventDefault(); return; }
      if (a.isCfgOpen()) {                                               // menu de config de mapa [M]
        if (isUp(e.code)) a.cfgNav(-1);
        if (isDown(e.code)) a.cfgNav(1);
        if (isLeft(e.code)) a.cfgChange(-1);
        if (isRight(e.code)) a.cfgChange(1);
        if (e.code === 'Enter') a.cfgClose();
        e.preventDefault(); return;
      }
      if (isLeft(e.code)) { a.planeNav(-1); e.preventDefault(); return; }
      if (isRight(e.code)) { a.planeNav(1); e.preventDefault(); return; }
      if (isConfirm(e.code)) { flags.startReq = true; e.preventDefault(); return; }
    }
    if (S.state === 'story') {                                           // HISTORIA: Esc vuelve al menu
      if (isBack(e.code)) { a.escToMenu(); e.preventDefault(); return; }
    }
    // PIRUETA (tonel): doble-tap ← / → en vuelo — solo pulsaciones frescas, no auto-repeat
    if (!e.repeat && S.state === 'play') {
      const nowS = performance.now() / 1000;
      if (isLeft(e.code)) { if (nowS - tapL < 0.28) a.roll(-1); tapL = nowS; }
      if (isRight(e.code)) { if (nowS - tapR < 0.28) a.roll(1); tapR = nowS; }
    }
    // anyPress solo con pulsaciones FRESCAS (!e.repeat): el auto-repeat de una tecla sostenida no
    // debe saltear pantallas (historia, derribado, transiciones). inp si se re-setea siempre.
    if (KEYMAP[e.code] !== undefined) { inp[KEYMAP[e.code]] = 1; if (!e.repeat) flags.anyPress = true; e.preventDefault(); }
    if (isFire(e.code)) { inp.fire = true; if (!e.repeat) flags.anyPress = true; e.preventDefault(); }
    if (isTurbo(e.code)) { inp.turbo = true; if (!e.repeat) flags.anyPress = true; }
    if (e.code === 'KeyV' && !e.repeat) a.cycleCamera();                 // cicla las 4 camaras
    if (e.code === 'KeyZ' || e.code === 'Tab') { inp.msl = true; if (!e.repeat) flags.anyPress = true; e.preventDefault(); }   // misil (Z o TAB)
    if (e.code === 'Enter' && !e.repeat) flags.anyPress = true;
    // MUSICA: tecla 1 = pista anterior, tecla 2 = siguiente (el motor lo ignora fuera de modo)
    if (!e.repeat && (e.code === 'Digit1' || e.code === 'Numpad1')) a.trackPrev();
    if (!e.repeat && (e.code === 'Digit2' || e.code === 'Numpad2')) a.trackNext();
  });
  addEventListener('keyup', e => {
    readCaps(e);
    if (KEYMAP[e.code] !== undefined) inp[KEYMAP[e.code]] = 0;
    if (isFire(e.code)) inp.fire = false;
    if (isTurbo(e.code)) inp.turbo = false;
    if (e.code === 'KeyZ' || e.code === 'Tab') inp.msl = false;
  });

  // tactil: arrastre a la izquierda = volar; derecha arriba = fuego; derecha abajo = turbo
  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); cv.focus(); audio(); flags.anyPress = true;
    const p = canvasPos(e);
    if (S.state === 'modeselect') { a.modeSelect(Math.floor((p.y - 60) / 34)); return; }   // tap en una fila
    if (S.state === 'menu') {
      if (a.isCfgOpen()) { a.cfgClose(); return; }                      // en config, tocar cierra
      if (p.x < W * 0.28) a.planeNav(-1);
      else if (p.x > W * 0.72) a.planeNav(1);
      else flags.startReq = true;
      return;
    }
    // PC (mouse): click izq = canon sostenido, click der = misil — en juego y momentum
    if (e.pointerType === 'mouse' && (S.state === 'play' || S.state === 'momentum')) {
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
    readCaps(e);
    // el mouse LIBERA la mira solo con CAPS LOCK activa; sin caps, la mira queda fija (readCaps ya la fijo)
    if (e.pointerType === 'mouse') { const p = canvasPos(e); mouse.x = p.x; mouse.y = p.y; if (capsOn) mouse.on = true; }
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
  // Se puede JUGAR entero con el joystick. Mapeo (botones estilo PlayStation; ✕=0 ◯=1 ▢=2 △=3):
  //   Stick izq izq/der          esquivar
  //   Stick izq VERTICAL         throttle: ARRIBA sube (gas) · ABAJO baja (picada)   L1 (4) invierte
  //   Stick der                  MIRA (fluida)     R1 (5)             fija / libera la mira (fija x default)
  //   gatillo (7)                turbo
  //   ✕ Cross (0)                METRALLETA (y OK / avanzar en menus)
  //   ▢ Square (2)               MISIL             ◯ Circle (1)       atras (volver)
  //   L3 (10) / R3 (11)          pista musical ◄ / ►     cruceta       navegar los menus
  //   (△ Triangle y un gatillo quedan libres)
  //
  // El vuelo se ESCRIBE en `inp` solo mientras el pad lo pisa (setPad limpia al soltar), asi
  // convive con el teclado sin pisarlo. La navegacion de menus y las acciones (tonel, camara,
  // pista) van por FLANCO (una pulsacion = una accion), igual que el teclado.
  const AX_DZ = 0.35;                          // zona muerta de los sticks (vuelo/menus)
  const AIM_DZ = 0.15, AIM_SPEED = 345;        // MIRA con stick derecho: zona muerta fina + px/seg
  const padHeld = { l: 0, r: 0, u: 0, d: 0, fire: false, turbo: false, msl: false };
  let btnPrev = [];                            // estado previo de botones (flanco)
  let padLast = performance.now();             // para el dt del movimiento fluido de la mira
  let aimLock = true;                          // R1: mira FIJA en el centro (DEFAULT) / LIBRE con stick
  let throttleInvert = false;                  // L1: eje vertical. false = ARRIBA sube (default); true = ABAJO sube
  let capsOn = false;                          // CAPS LOCK (teclado): true = mira LIBRE con mouse; false = mira FIJA
  const nav = { u: false, d: false, l: false, r: false };   // navegacion previa (cruceta+stick)

  // CAPS LOCK gobierna la mira en teclado: activa = libre (la mueve el mouse), inactiva = fija.
  // Se lee de cada evento de teclado/puntero; al quedar inactiva, fija la mira en el acto.
  function readCaps(e) { if (e.getModifierState) capsOn = e.getModifierState('CapsLock'); if (!capsOn) mouse.on = false; }

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

    const inGame = S.state === 'play' || S.state === 'takeoff' || S.state === 'momentum';
    if (inGame) {
      const lx = ax(0), ly = ax(1);
      setPad('l', (lx < 0 || down(14)) ? 1 : 0);               // stick izq / cruceta izq = esquivar
      setPad('r', (lx > 0 || down(15)) ? 1 : 0);
      // THROTTLE en el stick VERTICAL: por defecto ABAJO sube (gas), ARRIBA baja (picada). L1 lo
      // invierte. Con el stick centrado NO hay gas → el avion cae (mecanica central del juego).
      if (hit(4)) { throttleInvert = !throttleInvert; a.throttleInvert(throttleInvert); }   // L1 = invertir eje
      setPad('u', (throttleInvert ? ly > 0 : ly < 0) ? 1 : 0);  // potencia (gas / subir)  — default: ARRIBA sube
      setPad('d', (throttleInvert ? ly < 0 : ly > 0) ? 1 : 0);  // picada (bajar)
      setPad('fire', down(0));                                 // ✕ Cross = metralleta
      setPad('turbo', down(7));                                // turbo (gatillo)
      setPad('msl', down(2));                                  // ▢ Square = misil

      // MIRA: R1 alterna FIJA (centrada, sin tocar el stick) / LIBRE (stick derecho la mueve). Por
      // DEFAULT queda FIJA. Solo tocamos mouse.on al fijar (flanco) o al mover el stick libre, para
      // no pisar la mira del mouse cuando se juega con teclado y hay un joystick conectado.
      if (hit(5)) { aimLock = !aimLock; if (aimLock) mouse.on = false; a.aimLock(aimLock); }
      if (!aimLock) {
        // stick DERECHO: mueve el reticulo de forma fluida (velocidad por deflexion, con dt real)
        const rx = gp.axes[2] || 0, ry = gp.axes[3] || 0, mag = Math.hypot(rx, ry);
        if (mag > AIM_DZ) {
          const k = ((mag - AIM_DZ) / (1 - AIM_DZ)) / mag;     // recorta la zona muerta radial, conserva direccion
          mouse.x = Math.max(0, Math.min(W, mouse.x + rx * k * AIM_SPEED * dt));
          mouse.y = Math.max(0, Math.min(H, mouse.y + ry * k * AIM_SPEED * dt));
          mouse.on = true;
        }
      }
    } else {
      for (const f of ['l', 'r', 'u', 'd', 'fire', 'turbo', 'msl']) setPad(f, 0);   // soltar el vuelo
      // navegacion de menus por FLANCO (cruceta o stick)
      const nu = down(12) || ax(1) < -0.5, nd = down(13) || ax(1) > 0.5;
      const nl = down(14) || ax(0) < -0.5, nr = down(15) || ax(0) > 0.5;
      const confirm = hit(0) || hit(9);                        // A / Start
      if (S.state === 'modeselect') {
        if ((nu && !nav.u) || (nl && !nav.l)) a.modeNav(-1);
        if ((nd && !nav.d) || (nr && !nav.r)) a.modeNav(1);
        if (confirm) a.confirm();
      } else if (S.state === 'menu') {
        if (nl && !nav.l) a.planeNav(-1);
        if (nr && !nav.r) a.planeNav(1);
        if (confirm) flags.startReq = true;
        if (hit(1)) a.escToMenu();                             // B = volver
      }
      // el resto de pantallas (historia, derribado, recuento, victoria) avanzan con anyPress
      nav.u = nu; nav.d = nd; nav.l = nl; nav.r = nr;
    }
    btnPrev = pressed;
    requestAnimationFrame(pollGamepad);
  }
  requestAnimationFrame(pollGamepad);
}
