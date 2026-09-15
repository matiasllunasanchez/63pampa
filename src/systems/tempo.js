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
// LA BARRA se carga CON ESQUIVES (15/9; antes eran puntos): lo que compra el poder es el RIESGO
// bien jugado, no jugar bien en general. tick() recibe el recuento de esquives de la corrida y
// carga con el DELTA — el mismo truco de antes, asi que ninguna fuente de esquives necesita
// avisarle a este modulo y cualquiera que se agregue carga sola. Llena, se LANZA:
// dura LOS SEGUNDOS QUE JUNTASTE (el drenaje usa el dt CRUDO, no el escalado) y se descarga
// ENTERA — cortar antes con la tecla descarta el resto, como un super de arcade.
//
// SUBSISTEMA con estado propio (on/seg), privado del modulo, leido por accesores — el mismo
// patron que momentum/arena. Sin imports de stores: tick() recibe "inPlay" y "score" ya
// resueltos por el orquestador (game.js sabe de S.state, cfg.devcam y run), y gracias a eso
// tools/feeltest.js lo corre tal cual, como a core/aero.js.

import { TEMPO_SCALE, TEMPO_TOPE } from '../data/tuning.js';

let on = false;        // ¿el tiempo esta partido AHORA?
let seg = 0;           // SEGUNDOS de camara lenta guardados (arranca en 0: se ganan esquivando)
let lastEsq = -1;      // ultimo recuento de esquives visto, para cargar por delta (-1 = re-sincronizar)

/**
 * Tecla 4. Devuelve la señal para el feedback (game.js pone el beep y el popup):
 * 'on' (lanzado) | 'off' (cortado a mano: descarta el resto) | 'empty' (la barra no esta llena).
 */
export function toggle() {
  if (on) { on = false; seg = 0; return 'off'; }
  // SE PUEDE LANZAR A MEDIO LLENAR, y es el punto: el poder existe para usarse CUANDO HACE FALTA,
  // no cuando la barra lo permite. Con tres segundos guardados, dura tres. El unico piso es que
  // haya al menos uno — medio segundo de camara lenta no es un poder, es un tropiezo.
  if (seg < 1) return 'empty';
  on = true; return 'on';
}

/**
 * Una vez por frame, ANTES de escalar el dt, con el dt CRUDO. `inPlay` = pasillo jugable
 * (game.js resuelve: estado 'play' y sin devcam); `score` = run.score. Devuelve 'ready' UNA vez
 * cuando la barra se llena (game.js avisa con popup + beep) y null el resto del tiempo.
 * Salir del pasillo — muerte, relevo, climax, devcam — corta el poder solo; la CARGA sobrevive
 * al relevo (es de la corrida, como el score), pero lo lanzado se pierde con el avion.
 */
export function tick(dt, inPlay, esquives) {
  if (!inPlay) {
    if (on) { on = false; seg = 0; }
    lastEsq = -1;                               // al volver, cargar desde el recuento de ese momento
    return null;
  }
  if (lastEsq < 0) lastEsq = esquives;
  let ready = null;
  if (!on && esquives > lastEsq && seg < TEMPO_TOPE) {   // lanzado no recarga: primero se gasta
    const antes = seg;
    seg = Math.min(TEMPO_TOPE, seg + (esquives - lastEsq));
    if (antes < TEMPO_TOPE && seg >= TEMPO_TOPE) ready = 'ready';
  }
  lastEsq = esquives;
  if (on) {
    // SE GASTA EN SEGUNDOS REALES y dura LO QUE JUNTASTE: seis esquives son seis segundos de
    // instinto, dos son dos. No hay duracion fija que desmienta al "+1 seg" de la pantalla.
    seg -= dt;
    if (seg <= 0) { seg = 0; on = false; }      // se agoto: el mundo vuelve de golpe
  }
  return ready;
}

/** multiplicador del dt del mundo: 1 en tiempo real, TEMPO_SCALE con el poder lanzado. */
export const scale = () => (on ? TEMPO_SCALE : 1);

export const active = () => on;
export const meterVal = () => seg / TEMPO_TOPE;
/** Los segundos guardados, para quien tenga que decir un numero. */
export const segVal = () => seg;

/** arranque de partida: barra vacia, poder apagado. */
export function resetTempo() { on = false; seg = 0; lastEsq = -1; }

// sondas para las pruebas headless (mismo patron que __adbg/__aset del arena)
if (typeof window !== 'undefined') {
  window.__tdbg = () => JSON.stringify({ on, seg: +seg.toFixed(2), meter: +meterVal().toFixed(3), scale: scale() });
  window.__tcharge = n => { seg = Math.min(TEMPO_TOPE, seg + n); return meterVal(); };
}
