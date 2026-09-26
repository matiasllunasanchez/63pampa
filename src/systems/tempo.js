// MOMENTUM (ROADMAP #13): el ESPECIAL de camara lenta del jugador. Tecla 4 en el PASILLO.
//
// NO confundir con systems/momentum.js, que es el bullet-time VIEJO del climax sin 3D y quedo
// con ese nombre por herencia historica (ver el aviso de vocabulario en docs/ARQUITECTURA.md).
// Este modulo se llama "tempo" justamente para no chocar con ese archivo mientras exista.
//
// COMO FUNCIONA: el loop (game.js frame) calcula el dt crudo, llama tick() con el, y multiplica
// el dt que le pasa a update() por scale(). Como TODO el juego integra sobre ese unico dt y
// nada usa reloj de pared, ralentizar el mundo es este multiplicador y nada mas: spawns, flak,
// particulas y lluvia se frenan en sincronia perfecta sin tocar ningun sistema.
//
// LA BARRA SE CARGA CON TIEMPO (pedido del autor, 26/9/2026 — antes, desde el 3/8, con puntos):
// es un TIEMPO DE CASTEO. Tarda `cast` segundos reales en llenarse, lanzada dura `dur` segundos
// reales (el drenaje usa el dt CRUDO, no el escalado) y se descarga ENTERA — cortar antes con la
// tecla descarta el resto, como un super de arcade. Los dos numeros salen del NIVEL: la cantidad
// de mejoras que lleva el jugador (TEMPO_NIVELES en data/tuning.js), que game.js resuelve y pasa.
// Por que se fue la carga por puntos esta contado alla.
//
// SUBSISTEMA con estado propio (on/meter), privado del modulo, leido por accesores — el mismo
// patron que momentum/arena. Sin imports de stores: tick() recibe "inPlay" y el NIVEL ya
// resueltos por el orquestador (game.js sabe de S.state, cfg.devcam y las mejoras), y gracias a
// eso tools/feeltest.js lo corre tal cual, como a core/aero.js.

import { TEMPO_SCALE, tempoNivel } from '../data/tuning.js';

let on = false;        // ¿el tiempo esta partido AHORA?
let meter = 0;         // 0..1, la barra del especial (arranca VACIA: el primero tambien se espera)
let dur = tempoNivel(0).dur;   // lo que dura el lanzado EN CURSO (se fija al lanzar, ver toggle)

/**
 * Tecla 4. Devuelve la señal para el feedback (game.js pone el beep y el popup):
 * 'on' (lanzado) | 'off' (cortado a mano: descarta el resto) | 'empty' (la barra no esta llena).
 */
export function toggle(nivel) {
  if (on) { on = false; meter = 0; return 'off'; }
  if (meter < 1) return 'empty';
  // LA DURACION SE FIJA AL LANZAR: si justo te llega una mejora con el especial corriendo, el que
  // ya lanzaste termina como empezo. Cambiarla en el aire haria saltar la barra que se vacia.
  dur = tempoNivel(nivel).dur;
  on = true; return 'on';
}

/**
 * Una vez por frame, ANTES de escalar el dt, con el dt CRUDO. `inPlay` = pasillo jugable (game.js
 * resuelve: estado 'play' y sin devcam); `nivel` = cuantas mejoras lleva el jugador. Devuelve
 * 'ready' UNA vez cuando la barra se llena (game.js avisa con popup + beep) y null el resto.
 * Salir del pasillo — muerte, relevo, climax, devcam — corta el poder solo; la CARGA sobrevive
 * al relevo (es de la corrida), pero lo lanzado se pierde con el avion.
 *
 * FUERA DEL PASILLO NO CARGA: el reloj de casteo es tiempo de VUELO. Si cargara en el menu de
 * pausa, en una charla o en el negro de la suelta, bastaria con esperar quieto para tenerlo.
 */
export function tick(dt, inPlay, nivel) {
  if (!inPlay) {
    if (on) { on = false; meter = 0; }
    return null;
  }
  let ready = null;
  if (on) {
    meter -= dt / dur;
    if (meter <= 0) { meter = 0; on = false; }  // se agoto: el mundo vuelve de golpe
  } else if (meter < 1) {                       // lanzado no recarga: primero se gasta el super
    meter = Math.min(1, meter + dt / tempoNivel(nivel).cast);
    if (meter >= 1) ready = 'ready';
  }
  return ready;
}

/** multiplicador del dt del mundo: 1 en tiempo real, TEMPO_SCALE con el poder lanzado. */
export const scale = () => (on ? TEMPO_SCALE : 1);

export const active = () => on;
export const meterVal = () => meter;

/** arranque de partida: barra vacia, poder apagado. */
export function resetTempo() { on = false; meter = 0; dur = tempoNivel(0).dur; }

// sondas para las pruebas headless (mismo patron que __adbg/__aset del arena)
if (typeof window !== 'undefined') {
  window.__tdbg = () => JSON.stringify({ on, meter: +meter.toFixed(3), scale: scale() });
  // `p` es la FRACCION de barra (1 = llena). Antes eran puntos; la sonda sigue llenando igual con 9999.
  window.__tcharge = p => { meter = Math.min(1, meter + Math.max(0, p)); return meter; };
}
