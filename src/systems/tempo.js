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
// LA BARRA se carga CON PUNTOS (decision 3/8): jugar bien es lo que compra el poder. tick()
// recibe el score de la corrida y carga con el DELTA — asi ningun punto del juego necesita
// avisarle a este modulo, y cualquier fuente futura de puntos carga sola. Llena, se LANZA:
// dura TEMPO_DUR segundos REALES (el drenaje usa el dt CRUDO, no el escalado) y se descarga
// ENTERA — cortar antes con la tecla descarta el resto, como un super de arcade.
//
// SUBSISTEMA con estado propio (on/meter), privado del modulo, leido por accesores — el mismo
// patron que momentum/arena. Sin imports de stores: tick() recibe "inPlay" y "score" ya
// resueltos por el orquestador (game.js sabe de S.state, cfg.devcam y run), y gracias a eso
// tools/feeltest.js lo corre tal cual, como a core/aero.js.

import { TEMPO_SCALE, TEMPO_DUR, TEMPO_CHARGE } from '../data/tuning.js';

let on = false;        // ¿el tiempo esta partido AHORA?
let meter = 0;         // 0..1, la barra del especial (arranca VACIA: se gana jugando)
let lastScore = -1;    // ultimo score visto, para cargar por delta (-1 = re-sincronizar)

/**
 * Tecla 4. Devuelve la señal para el feedback (game.js pone el beep y el popup):
 * 'on' (lanzado) | 'off' (cortado a mano: descarta el resto) | 'empty' (la barra no esta llena).
 */
export function toggle() {
  if (on) { on = false; meter = 0; return 'off'; }
  if (meter < 1) return 'empty';
  on = true; return 'on';
}

/**
 * Una vez por frame, ANTES de escalar el dt, con el dt CRUDO. `inPlay` = pasillo jugable
 * (game.js resuelve: estado 'play' y sin devcam); `score` = run.score. Devuelve 'ready' UNA vez
 * cuando la barra se llena (game.js avisa con popup + beep) y null el resto del tiempo.
 * Salir del pasillo — muerte, relevo, climax, devcam — corta el poder solo; la CARGA sobrevive
 * al relevo (es de la corrida, como el score), pero lo lanzado se pierde con el avion.
 */
export function tick(dt, inPlay, score) {
  if (!inPlay) {
    if (on) { on = false; meter = 0; }
    lastScore = -1;                             // al volver, cargar desde el score de ese momento
    return null;
  }
  if (lastScore < 0) lastScore = score;
  let ready = null;
  if (!on && score > lastScore && meter < 1) {  // lanzado no recarga: primero se gasta el super
    meter = Math.min(1, meter + (score - lastScore) / TEMPO_CHARGE);
    if (meter >= 1) ready = 'ready';
  }
  lastScore = score;
  if (on) {
    meter -= dt / TEMPO_DUR;
    if (meter <= 0) { meter = 0; on = false; }  // se agoto: el mundo vuelve de golpe
  }
  return ready;
}

/** multiplicador del dt del mundo: 1 en tiempo real, TEMPO_SCALE con el poder lanzado. */
export const scale = () => (on ? TEMPO_SCALE : 1);

export const active = () => on;
export const meterVal = () => meter;

/** arranque de partida: barra vacia, poder apagado. */
export function resetTempo() { on = false; meter = 0; lastScore = -1; }

// sondas para las pruebas headless (mismo patron que __adbg/__aset del arena)
if (typeof window !== 'undefined') {
  window.__tdbg = () => JSON.stringify({ on, meter: +meter.toFixed(3), scale: scale() });
  window.__tcharge = p => { meter = Math.min(1, meter + p / TEMPO_CHARGE); return meter; };
}
