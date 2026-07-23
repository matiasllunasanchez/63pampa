// INPUT: el unico lugar que escucha teclado, mouse y tactil, y traduce todo a estado.
//
// El juego NO lee el DOM en ningun otro lado: lee estos objetos. Eso es lo que permite que el
// vuelo, el momentum y el HUD razonen sobre "el jugador esta girando / disparando" sin saber si
// vino de una flecha, un arrastre tactil o un stick.
//
// LO QUE EXPONE (estado, identidad estable — se muta, no se reasigna):
//   inp      controles de vuelo: l/r/u/d + fire/turbo/msl
//   mouse    la MIRA en PC (x,y en pantalla; `on` se enciende al primer movimiento de mouse)
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
    if (e.code === 'KeyZ') { inp.msl = true; if (!e.repeat) flags.anyPress = true; e.preventDefault(); }   // misil
    if (e.code === 'Enter' && !e.repeat) flags.anyPress = true;
    // MUSICA: tecla 1 = pista anterior, tecla 2 = siguiente (el motor lo ignora fuera de modo)
    if (!e.repeat && (e.code === 'Digit1' || e.code === 'Numpad1')) a.trackPrev();
    if (!e.repeat && (e.code === 'Digit2' || e.code === 'Numpad2')) a.trackNext();
  });
  addEventListener('keyup', e => {
    if (KEYMAP[e.code] !== undefined) inp[KEYMAP[e.code]] = 0;
    if (isFire(e.code)) inp.fire = false;
    if (isTurbo(e.code)) inp.turbo = false;
    if (e.code === 'KeyZ') inp.msl = false;
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
    if (e.pointerType === 'mouse') { const p = canvasPos(e); mouse.x = p.x; mouse.y = p.y; mouse.on = true; }
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

  // JOYSTICK: por ahora solo cambia de pista musical (el vuelo se maneja con teclado/mouse/tactil).
  // L3 = click del stick izquierdo (boton 10) → pista anterior; R3 = stick derecho (boton 11) →
  // siguiente. Mapeo estandar del Gamepad API. Se detectan por FLANCO (una pulsacion = un cambio).
  const L3 = 10, R3 = 11;
  let l3Prev = false, r3Prev = false;
  const padDown = (pads, i) => pads.some(gp => gp && gp.buttons[i] && gp.buttons[i].pressed);
  function pollGamepad() {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()] : [];
    const l = padDown(pads, L3), r = padDown(pads, R3);
    if (l && !l3Prev) a.trackPrev();
    if (r && !r3Prev) a.trackNext();
    l3Prev = l; r3Prev = r;
    requestAnimationFrame(pollGamepad);
  }
  requestAnimationFrame(pollGamepad);
}
