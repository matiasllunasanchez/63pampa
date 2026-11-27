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

import { TEMPO_SCALE, TEMPO_SUAVE, tempoNivel } from '../data/tuning.js';

// DOS NIVELES (21/11, el autor: "momentum tiene que durar mas y tener dos niveles: uno, y si apretas otra vez es igual
// de lento que ahora"): el primer toque parte el tiempo SUAVE (TEMPO_SUAVE); otro toque con el poder puesto lo lleva
// a lo lento de siempre (TEMPO_SCALE) con lo que queda de barra; el tercero lo corta. Duracion y recarga, en la tabla
// DOS CARGAS (27/11, el autor: "la barra de momentum tiene 2 niveles, quiza podemos hacer 2 cargas, y si presiono 2 veces
// mientras una se esta gastando se gastan las dos a la vez"): la barra junta HASTA DOS cargas, de a una (`cast` cada una).
// Un toque gasta UNA en lo SUAVE. Otro toque con el poder puesto y la segunda carga lista lo lleva a lo LENTO y gasta las
// dos juntas —al doble de velocidad: dura lo mismo que una—. Sin segunda carga, el segundo toque lo corta.
export const CARGAS = 2;
let on = false;        // ¿el tiempo esta partido AHORA?
let fase = 0;          // 1 = suave, 2 = lento (el de siempre); 0 apagado
let meter = 0;         // 0..CARGAS: las cargas juntadas (1,5 = una llena y media)
let fin = 0;           // hasta donde baja la barra el lanzado EN CURSO (lo que queda guardado)
let dur = tempoNivel(0).dur;   // lo que dura una carga del lanzado EN CURSO (se fija al lanzar, ver toggle)

/**
 * Tecla 4. Devuelve la señal para el feedback (game.js pone el beep y el popup):
 * 'on' (lanzado) | 'mas' (las dos cargas, mas lento) | 'off' (cortado a mano: descarta lo que se gastaba) |
 * 'empty' (no hay ni una carga).
 */
export function toggle(nivel) {
  if (on && fase === 1 && fin >= 1) { fase = 2; fin -= 1; return 'mas'; }
  if (on) { on = false; fase = 0; meter = fin; return 'off'; }
  if (meter < 1) return 'empty';
  // LA DURACION SE FIJA AL LANZAR: si justo te llega una mejora con el especial corriendo, el que
  // ya lanzaste termina como empezo. Cambiarla en el aire haria saltar la barra que se vacia.
  dur = tempoNivel(nivel).dur;
  fin = meter - 1;
  on = true; fase = 1; return 'on';
}

/**
 * Una vez por frame, ANTES de escalar el dt, con el dt CRUDO. `inPlay` = pasillo jugable (game.js
 * resuelve: estado 'play' y sin devcam); `nivel` = cuantas mejoras lleva el jugador. Devuelve
 * 'ready' cada vez que se completa una carga (game.js avisa con popup + beep) y null el resto.
 * Salir del pasillo — muerte, relevo, climax, devcam — corta el poder solo; la CARGA sobrevive
 * al relevo (es de la corrida), pero lo lanzado se pierde con el avion.
 *
 * FUERA DEL PASILLO NO CARGA: el reloj de casteo es tiempo de VUELO. Si cargara en el menu de
 * pausa, en una charla o en el negro de la suelta, bastaria con esperar quieto para tenerlo.
 */
export function tick(dt, inPlay, nivel, rapido = 1) {   // (`rapido`: el tutorial recarga mas ligero, 27/11)
  if (!inPlay) {
    if (on) { on = false; fase = 0; meter = fin; }
    return null;
  }
  let ready = null;
  if (on) {
    meter -= (fase === 2 ? 2 : 1) * dt / dur;
    if (meter <= fin) { meter = fin; on = false; fase = 0; }  // se agoto: el mundo vuelve de golpe
  } else if (meter < CARGAS) {                  // lanzado no recarga: primero se gasta el super
    const antes = Math.floor(meter);
    meter = Math.min(CARGAS, meter + dt * rapido / tempoNivel(nivel).cast);
    if (Math.floor(meter) > antes) ready = 'ready';
  }
  return ready;
}

/** multiplicador del dt del mundo: 1 en tiempo real, TEMPO_SCALE con el poder lanzado. */
export const scale = () => (on ? (fase === 2 ? TEMPO_SCALE : TEMPO_SUAVE) : 1);
/** 1 suave, 2 lento, 0 apagado (para el cartel y el HUD). */
export const nivelFase = () => (on ? fase : 0);

export const active = () => on;
export const meterVal = () => meter;

/** arranque de partida: barra vacia, poder apagado. */
/** Llena la barra (el TUTORIAL, para enseñarlo sin hacer esperar: data/tutorial.js `llena`). */
export function llenar(n = 1) { meter = Math.max(meter, Math.min(CARGAS, n)); }
export function resetTempo() { on = false; fase = 0; meter = 0; fin = 0; dur = tempoNivel(0).dur; }

// sondas para las pruebas headless (mismo patron que __adbg/__aset del arena)
if (typeof window !== 'undefined') {
  window.__tdbg = () => JSON.stringify({ on, meter: +meter.toFixed(3), scale: scale() });
  // `p` es la FRACCION de barra (1 = llena). Antes eran puntos; la sonda sigue llenando igual con 9999.
  // SIN ARGUMENTO LA LLENA (12/10): la fila EL MOMENTUM CARGADO de PRUEBAS la llama asi, y
  // `Math.max(0, undefined)` es NaN — la barra quedaba en NaN toda la corrida y la tecla 4 no
  // respondia nunca. Cualquier cosa que no sea un numero cuenta como cero, nunca como NaN.
  window.__tcharge = p => {
    const n = p === undefined ? 1 : Number(p);
    meter = Math.min(CARGAS, meter + Math.max(0, Number.isFinite(n) ? n : 0));
    return meter;
  };
}
