// EL PODER RASANTE (SPEC_PODER_RASANTE, tecla 6): el juego activando su propio nombre.
//
// El CUARTO poder del PASILLO, y el que cierra los cuatro ejes: turbo = velocidad · MOMENTUM =
// tiempo (systems/tempo.js) · CHANCHA = nafta (systems/chancha.js) · RASANTE = ALTURA.
//
// LA IDEA EN UNA FRASE: por unos segundos el avion QUIERE estar al ras. El default vertical se
// INVIERTE —sin input desciende suave y se ASIENTA en RAS_ALT, el reposo es la gloria y no la
// caida—, el mundo enmudece, la camara baja, y vos solo esquivas y disfrutas la banda del x10 que
// el resto del juego te hace sudar.
//
// LA CARGA ES SKILL PREVIA. No se llena con puntos (eso ya lo hacen los otros dos) ni con tiempo
// de pared: se llena con SEGUNDOS EN LA BANDA DEL x10 VOLADOS A MANO. Volas bajo para ganarte
// volar bajo glorioso. Es lo que impide que sea un multiplicador gratis (RF-07) — el poder no da
// puntos propios: el x10 lo sigue dando la altura, como siempre.
//
// DISCIPLINA DE MODULO (la misma de sus dos hermanos): estado propio y privado, leido por
// accesores; CERO imports de stores; `tick()` recibe el mundo ya resuelto por el orquestador y
// DEVUELVE señales — nunca llama hacia arriba. Gracias a eso `tools/feeltest.js` lo corre tal
// cual, sin navegador y sin juego.
//
// LO QUE ESTE MODULO NO HACE, Y ES DELIBERADO (§6): no mueve el avion (el resorte lo aplica
// `flight.js` preguntando `active()`), no vuelve invulnerable (las olas de cara, los obstaculos y
// el fuego matan igual) y no asiste: ↑ responde siempre, con la fuerza de siempre.

import { RAS_ALT, RAS_SPRING, RAS_CEIL, RAS_DUR, RAS_CAM, RAS_CAMS,
  RAS_LATIDO, RAS_LAT_T } from '../data/tuning.js';

// LA BANDA DEL x10 termina en `BANDA_ALT` (data/tuning.js) y ese numero NO vive aca: lo mide
// flight.js y el orquestador pasa `enBanda` ya resuelto. Si este modulo lo recalculara habria dos
// verdades — que es justo el problema que la constante vino a cerrar.
let on = false;        // ¿el poder esta lanzado AHORA?
let t = 0;             // reloj del lanzamiento, en segundos de MUNDO
// YA NO HAY BARRA QUE GUARDAR. La que habia se derivaba de los segundos de banda, y esa carga
// desaparecio entera: los segundos los trae la racha. Queda la leccion que costo media hora en su
// momento y que sigue valiendo — UNA sola verdad: `dur` y `t`, y todo lo demas se deriva.
// LA DURACION YA NO ES FIJA NI SE ACUMULA ACA (13/9). El poder dejo de cargarse con TIEMPO en la
// banda: eso se llenaba por ESTAR y no por hacer, y ademas el estado RASANTE se lo cargaba gratis
// —medido: la barra subia de 0,259 a 0,499 en seis segundos mientras el aguante clavaba el avion,
// que es el "darse cuerda a si mismo" que este archivo ya prohibia para el poder puesto—.
// Ahora los segundos los trae la RACHA: un acierto, un segundo, y el flow dura lo que juntaste.
let dur = 0;           // los segundos de ESTE lanzamiento; 0 si no hay ninguno
let usos = 0;          // cuantas veces se lanzo en esta corrida (para la leccion de primera vez)
let latT = 0;          // reloj del latido

/**
 * TECLA 6. Devuelve la señal para el feedback (game.js pone el beep, la radio y el popup):
 *   'on'    lanzado
 *   'off'   cortado a mano — descarta el resto, como un super de arcade
 *   'empty' la barra no esta llena
 * NUNCA consume la barra si no se lanza, que es la misma regla que `chancha.pedir`.
 */
export function toggle() {
  if (on) { on = false; t = 0; dur = 0; latT = 0; return 'off'; }
  return 'empty';                      // ya no se lanza a mano: el flow lo dispara la racha
}

/** EL FLOW SE DISPARA, con los segundos que la racha junto. Lo llama el orquestador cuando el
 *  aguante avisa que se lleno o que se termino — no el jugador. Al flow no se entra por decision:
 *  te agarra. (La habilidad de piloto que lo vuelve manual va a entrar por aca tambien.)
 *
 *  Devuelve 'on' si arranco, o null si los segundos no alcanzan: por debajo del piso el cambio de
 *  camara y de lamina es un parpadeo, no una rafaga. */
export function lanzar(segundos) {
  const s = Math.max(0, +segundos || 0);
  if (on || s <= 0) return null;
  on = true; t = 0; dur = s; latT = 0; usos++;
  return 'on';
}

/**
 * Una vez por cuadro, con el dt del MUNDO (no el crudo): asi el poder dura lo mismo en tiempo de
 * juego aunque se lo lance en camara lenta, que es como convive con el MOMENTUM (RF-06) — el
 * mismo criterio que el ETA de la Chancha.
 *
 * `e` = { inPlay } — el pasillo jugable (estado 'play', sin devcam y sin climax). La altura ya no
 * entra: el poder dejo de cargarse solo, asi que no tiene nada que preguntarle a la banda.
 *
 * Devuelve SIEMPRE un objeto: { sig } — 'ready' UNA vez cuando la barra se llena, 'end' UNA vez
 * cuando el lanzamiento se agota solo. El corte a mano no sale por aca: sale de `toggle()`.
 */
export function tick(dt, e) {
  const out = { sig: null, latido: false };
  if (!e.inPlay) {
    // Salir del pasillo —muerte, relevo, climax, devcam— APAGA el poder. La CARGA sobrevive (es
    // de la corrida, como el score y como la barra del MOMENTUM), pero lo lanzado se pierde con
    // el avion: es exactamente la misma regla que sus dos hermanos, y conviene que lo sea.
    if (on) { on = false; t = 0; latT = 0; }
    return out;
  }
  if (on) {
    t += dt;
    // EL LATIDO (RF-05). Va aca y no en el audio por el mismo motivo que las señales: este modulo
    // lleva el reloj del poder, asi que es el unico que sabe CUANDO late. El orquestador pone el
    // sonido. Y se acelera sobre el final —los ultimos tres segundos— porque es lo unico del poder
    // que avisa que se termina sin escribir un cartel: el cuerpo se entera antes que el ojo.
    if (RAS_LATIDO) {
      const ritmo = RAS_LAT_T * (restante() < 3 ? 0.55 : 1);
      latT += dt;
      if (latT >= ritmo) { latT -= ritmo; out.latido = true; }
    }
    if (t >= dur) { on = false; t = 0; dur = 0; latT = 0; out.sig = 'end'; }
  }
  return out;
}

/** ¿El resorte y el colchon estan puestos? Lo pregunta `flight.js` (RF-01, RF-02). */
export const active = () => on;
/** Lo que queda del lanzamiento, en segundos — lo dibuja la PALABRA, que se va apagando. */
export const restante = () => (on ? Math.max(0, dur - t) : 0);
/** Los segundos con los que arranco este lanzamiento: la palabra necesita los dos para saber que
 *  fraccion tiene que dibujar encendida. */
export const duracion = () => dur;
/** ¿Es la PRIMERA activacion de esta corrida? La leccion del sapito se muestra una vez (RF-05). */
export const primeraVez = () => usos === 1;

// LA CAMARA DEL PODER (RF-04). `RAS_CAM` es la perilla y `camNombre` la deja pisar desde una
// sonda: los dos prototipos se juzgan A FEEL, no leyendo numeros, y la eleccion final es un
// checkpoint con el director — el codigo no la decide.
let camNombre = RAS_CAM;
/** El encuadre del poder, o `null` si el poder no esta puesto. Lo consume `stepVuelo` a traves
 *  del orquestador: la cama de vuelo no sabe que existe este modulo. */
export const cam = () => (on ? (RAS_CAMS[camNombre] || RAS_CAMS.cola) : null);
/** ¿Se dibuja el avion? En CABINA no: la camara esta adentro, y el sprite en tercera dejaria dos
 *  aviones en el mismo cuadro — la misma leccion que la cabina del PULSO. */
export const enCabina = () => on && camNombre === 'cabina';
/** CUANTO SE AGRANDA EL SPRITE del avion durante el poder. Es lo unico que puede acercar el avion
 *  sin tocar `cam.y`: `camScale` escala el dibujo y nada mas — la POSICION en pantalla sigue
 *  saliendo de la proyeccion, o sea de la altura de la camara. Los dos ejes no se pueden separar
 *  mas que esto en un motor de horizonte fijo (ver §8). */
export const zoom = () => (on ? ((RAS_CAMS[camNombre] || {}).zoom || 1) : 1);

/** EL REPOSO Y EL TECHO, para quien tenga que dibujarlos o integrarlos. Salen de aca y no de
 *  tuning directo para que el dia que dependan del estado (una mejora de campaña, por ejemplo)
 *  cambien en un solo lugar. */
export const alt = () => RAS_ALT;
export const ceil = () => RAS_CEIL;
export const spring = () => RAS_SPRING;

/** Llena la barra a mano. Es la mitad util de la sonda `?rasante` y de `__rscharge`: sin esto,
 *  probar el resorte cuesta juntar una racha entera a mano EN CADA corrida del fixture, que es
 *  justo lo que un fixture no puede hacer bien. Ahora LANZA en vez de cargar. QUITAR. */
export function cargar(seg) {
  return lanzar(seg === undefined ? RAS_DUR : +seg) === 'on' ? dur : 0;
}

/** Arranque de PARTIDA (no de vida): barra vacia, poder apagado, banda a cero. Lo llama el reset
 *  del run, igual que resetTempo/resetChancha. */
export function resetRasante() { on = false; t = 0; dur = 0; latT = 0; usos = 0; camNombre = RAS_CAM; }

// ---------- SONDAS (QUITAR al cerrar el plan) ----------
// `__rsdbg()` es la foto entera del poder y `__rscharge(seg)` lo LANZA con los segundos que le
// pidas: sin la segunda, probar el resorte costaria juntar una racha entera a mano en cada corrida
// del fixture — y una racha a mano es justo lo que un fixture no puede hacer bien.
if (typeof window !== 'undefined') {
  window.__rsdbg = () => JSON.stringify({
    on, t: +t.toFixed(2), usos,
    resta: +restante().toFixed(2), alt: RAS_ALT, ceil: RAS_CEIL, spring: RAS_SPRING, dur: +dur.toFixed(2),
    cam: camNombre, lift: (RAS_CAMS[camNombre] || {}).lift, piso: (RAS_CAMS[camNombre] || {}).piso,
    lat: (RAS_CAMS[camNombre] || {}).lat || 0,
  });
  // CAMBIAR DE CAMARA EN VIVO (QUITAR). Es la sonda que el RF-04 pide por su nombre: los dos
  // prototipos se comparan volando el MISMO momento con una y con la otra, y eso no se puede si
  // hay que reiniciar entre medio.
  window.__rscam = n => { if (RAS_CAMS[n]) camNombre = n; return camNombre; };
  // BARRIDO DE ENCUADRE (QUITAR). Pisa `lift`/`piso` en vivo: elegir una camara mirando numeros no
  // se puede, y re-hornear el juego por cada valor tampoco. Con esto el barrido entero sale de una
  // sola corrida, con el mismo cielo y la misma hora — que es lo unico que hace comparables las fotos.
  window.__rslift = (lift, piso, lat, zoom) => {
    RAS_CAMS[camNombre] = { lift: +lift, piso: +piso, lat: +(lat || 0), zoom: +(zoom || 1) };
    return JSON.stringify(RAS_CAMS[camNombre]);
  };
  window.__rscharge = p => cargar(p);
}
