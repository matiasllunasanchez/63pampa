// LA TORMENTA: RELAMPAGOS, RAYOS Y TRUENOS (18/10/2026, el autor: "para TORMENTA me gustaria que hagas
// relampagos y truenos y rayos al fondo"). El estado vive aca; lo dibuja render/rayos.js y el trueno lo
// sintetiza systems/audio.js.
//
// Cada tantos segundos cae una DESCARGA, lejos, en el fondo:
//   · casi siempre con su RAYO visible —un zigzag del techo de nubes al horizonte, con alguna rama— que
//     parpadea dos o tres veces;
//   · a veces solo el RELAMPAGO (la nube que se prende sin rayo a la vista).
// Las dos levantan el FOGONAZO: la noche de la tormenta se abre de golpe y vuelve a cerrarse (render/noche.js
// recibe la oscuridad ya aflojada). El TRUENO llega despues, con el retraso de la distancia — cuanto mas
// tarde, mas lejos y mas bajo.
import { run } from '../core/run.js';
import { trueno, truenoOla } from './audio.js';
import { dado } from '../core/azar.js';
const rnd = dado('tormenta');   // el azar FIJO del libro de vuelo (core/azar.js)

const T = {
  cada: [2.6, 8],        // segundos entre descargas
  rayoP: 0.7,            // cuantas traen el rayo visible (el resto: relampago de nube)
  vida: 0.42,            // cuanto dura el rayo en pantalla
  retraso: [0.35, 2.6],  // del fogonazo al trueno (la distancia)
};

const rayos = [];        // { x (pantalla, sin la camara), puntos: [[dx, y]...], ramas: [[...]], t0, k }
let proxima = 1.5, fogonazo = 0, truenos = [];

/** Un zigzag de `y0` a `y1` en pantalla, con `paso` px por tramo y sacudones de `amp`. */
function zigzag(x, y0, y1, amp) {
  const pts = [[x, y0]];
  let cx = x;
  for (let y = y0; y < y1;) {
    y = Math.min(y1, y + 5 + rnd() * 9);
    cx += (rnd() - 0.5) * amp * 2;
    pts.push([cx, y]);
  }
  return pts;
}

/** Una descarga nueva: `hor` = la y del horizonte, `ancho` = el ancho de la pantalla. */
function descargar(hor, ancho) {
  const lejos = rnd();                                   // 0 cerca … 1 muy lejos
  const k = 1 - lejos * 0.6;
  fogonazo = Math.max(fogonazo, 0.55 + 0.45 * k);
  if (rnd() < T.rayoP) {
    const x = 20 + rnd() * (ancho - 40), y0 = Math.max(-10, hor - 110 - rnd() * 40);
    const tronco = zigzag(x, y0, hor - 1, 5 * k + 2);
    const ramas = [];
    for (let i = 0, n = rnd() < 0.6 ? 1 + (rnd() * 2 | 0) : 0; i < n; i++) {
      const p = tronco[1 + (rnd() * (tronco.length - 3) | 0)];
      ramas.push(zigzag(p[0], p[1], p[1] + 12 + rnd() * 26, 4));
    }
    rayos.push({ tronco, ramas, t0: run.t, k });
  }
  truenos.push({ t: run.t + T.retraso[0] + (T.retraso[1] - T.retraso[0]) * lejos, k });
}

/** UN RAYO A PEDIDO (la ola gigante, 13/11): cae en la fraccion `fx` (0..1) del ancho de la pantalla, detras
 *  de lo que este ahi. El horizonte y el ancho son los del ultimo cuadro (`stepTormenta`). */
let ultHor = 96, ultAncho = 480;
export function descargaEn(fx, z) {
  const k = 0.95, hor = ultHor, ancho = ultAncho, x = fx * ancho;
  fogonazo = Math.max(fogonazo, 0.9);
  const y0 = Math.max(-10, hor - 120 - rnd() * 30);
  const tronco = zigzag(Math.max(10, Math.min(ancho - 10, x)), y0, hor - 1, 6);
  const ramas = [];
  for (let i = 0, n = 1 + (rnd() * 2 | 0); i < n; i++) {
    const p = tronco[1 + (rnd() * (tronco.length - 3) | 0)];
    ramas.push(zigzag(p[0], p[1], p[1] + 14 + rnd() * 24, 4));
  }
  rayos.push({ tronco, ramas, t0: run.t, k });
  // EL TRUENO DE LA OLA (14/11): con los samples del autor, y con el retraso de la distancia — la ola a un
  // kilometro tarda casi dos segundos en sonar; encima, casi junto con el rayo
  if (z !== undefined) truenos.push({ t: run.t + 0.2 + Math.max(0, z) / 650 + rnd() * 0.25, k, ola: true, z });
  else truenos.push({ t: run.t + 0.3 + rnd() * 0.5, k });
}

/** Un cuadro de vuelo con tormenta. `hor`/`ancho` de la pantalla (render/ctx.js). */
export function stepTormenta(dt, hor, ancho) {
  ultHor = hor; ultAncho = ancho;
  proxima -= dt;
  if (proxima <= 0) { descargar(hor, ancho); proxima = T.cada[0] + rnd() * (T.cada[1] - T.cada[0]); }
  fogonazo = Math.max(0, fogonazo - dt * 3.2);
  for (let i = rayos.length - 1; i >= 0; i--) if (run.t - rayos[i].t0 > T.vida) rayos.splice(i, 1);
  for (let i = truenos.length - 1; i >= 0; i--) if (run.t >= truenos[i].t) {
    const tr = truenos[i];
    if (tr.ola) truenoOla(tr.z); else trueno(tr.k);
    truenos.splice(i, 1);
  }
}

/** Sin tormenta (o al cambiar de corrida): nada en el aire. */
export function resetTormenta() { rayos.length = 0; truenos = []; fogonazo = 0; proxima = 1.5; }

/** Lo que dibuja render/rayos.js: los rayos vivos y cuanto se ve cada uno ahora (parpadea). */
export function rayosVivos() {
  return rayos.map(r => {
    const e = (run.t - r.t0) / T.vida;
    // dos o tres golpes: prendido, apagado, prendido mas flojo
    const on = e < 0.18 ? 1 : e < 0.3 ? 0.15 : e < 0.55 ? 0.8 : e < 0.65 ? 0.1 : 0.45 * (1 - e);
    return { ...r, a: Math.max(0, on) * r.k };
  });
}
/** El fogonazo 0..1: cuanto se abre la noche ahora (y titila con el rayo). */
export const fogonazoTormenta = () => fogonazo;
