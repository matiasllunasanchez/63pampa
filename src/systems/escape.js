// EL ESCAPE — la linea recta (PLAN_VUELTA_REAL §2.B, V2). Los numeros en data/blanco.js (ESC).
//
// Corre en 'play' mientras dura el escape (desde el cruce del buque hasta el viraje). Tira las
// rafagas de popa y juzga si pegan; `step()` devuelve 'hit' en el cuadro en que una te alcanza, y
// game.js cobra el golpe — un sistema no llama hacia arriba.
import { plane } from '../core/state.js';
import { run } from '../core/run.js';
import { ESC } from '../data/blanco.js';
import { escape, resetEscape, tiroEn } from '../core/escape.js';
import { AGUA } from '../core/blanco.js';
import { piqueAgua } from '../core/fx.js';

let PZ = 14;

// Normal(0, s) con Box-Muller: la punteria se abre como una campana, no como un cuadrado.
const gauss = s => s * Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

/** El cruce: arranca el escape con el carril donde pasaste. `pz` llega por parametro (render). */
export function empezar(pz) {
  resetEscape();
  PZ = pz;
  escape.on = true;
  escape.carrilX = plane.x;
  xAnt = plane.x;
  escape.rafT = 0.4;   // la primera rafaga llega apenas bajas del salto
}

export function terminar() { resetEscape(); }
/** Un derribo durante el escape: lo que estaba en el aire no se hereda (morir dos veces). */
export function limpiar() { escape.tiros.length = 0; }

/** ¿Estas mostrando la panza? Fuera del carril, o en una pirueta (un tonel, un quiebre: rolar de
 *  verdad). EL ALABEO DEL ESQUIVE NO CUENTA: en el control directo cualquier movimiento lateral
 *  inclina el sprite casi a tope, y contarlo convertia a la vibora —que es moverse de lado— en
 *  mostrar la panza (medido: viboreando caias igual que yendo derecho). */
export const panza = () => Math.abs(plane.x - escape.carrilX) > ESC.CARRIL || !!run.mv;

/** Una rafaga: `n` tiros alrededor de (cx, cy) con dispersion `s`. */
function rafaga(n, cx, cy, s) {
  for (let i = 0; i < n; i++) {
    escape.tiros.push({
      ox: escape.carrilX + (Math.random() - 0.5) * 6, oy: AGUA + 1.5,
      ax: cx + gauss(s), ay: Math.max(AGUA + 0.5, cy + gauss(s * 0.7)),
      z: ESC.Z0 - i * 5, zPrev: ESC.Z0 - i * 5,
    });
  }
}

let xAnt = 0;
export function step(dt) {
  if (!escape.on) return null;
  escape.t += dt;
  escape.panza = panza();
  // EL SALTO TE DEJA ALTO UN RATO: sin la gracia, el techo a 6 completaba la barra del radar en el
  // cuadro del cruce y la oleada de misiles pegaba antes de que pudieras bajar (medido en V0).
  if (escape.t < ESC.GRACIA) run.detection = Math.min(run.detection, 0.9);

  // LA VIBORA (V3): pasada la linea recta, el artillero arma su solucion mientras volas predecible.
  const vib = escape.t >= ESC.RECTA_T && escape.t < ESC.VIBORA_HASTA;
  const entra = vib && !escape.vibora;
  escape.vibora = vib;
  if (vib) {
    // cada INVERSION del movimiento lateral la tira a cero: eso es viborear. La velocidad lateral
    // sale de cuanto se MOVIO el avion y no de `plane.vx`: con la mira del mouse o con el alabeo
    // el que mueve al avion no siempre escribe vx, y la vibora tiene que valer con cualquier control.
    const vx = dt > 0 ? (plane.x - xAnt) / dt : 0;
    if (Math.abs(vx) > ESC.VX_MIN) {
      const lado = Math.sign(vx);
      if (escape.lado && lado !== escape.lado) escape.sol = 0;
      escape.lado = lado;
    }
    if (escape.congela > 0) escape.congela -= dt;
    else escape.sol = Math.min(1, escape.sol + dt / ESC.SOL_T);
    // SOLUCION COMPLETA: rafaga precisa con plomo, adonde vas a estar
    if (escape.sol >= 1) {
      rafaga(ESC.POR_SOLUCION, plane.x + vx * ESC.PLOMO, plane.y, escape.panza ? ESC.SIGMA_PANZA : ESC.SIGMA_SOL);
      escape.sol = 0;
    }
  }
  // LAS RAFAGAS COMUNES de popa, mientras dura el alcance. En la linea recta la punteria depende de
  // la panza; en la vibora, ademas, se va cerrando con la solucion.
  if (escape.t < ESC.VIBORA_HASTA) {
    escape.rafT -= dt;
    if (escape.rafT <= 0) {
      escape.rafT = ESC.RAFAGA_CADA * (0.8 + Math.random() * 0.4);
      const s = escape.panza ? ESC.SIGMA_PANZA
        : vib ? ESC.SIGMA_RECTA + (ESC.SIGMA_SOL - ESC.SIGMA_RECTA) * escape.sol : ESC.SIGMA_RECTA;
      rafaga(ESC.POR_RAFAGA, plane.x, plane.y, s);
    }
  }
  let hit = false;
  for (const tr of escape.tiros) {
    tr.zPrev = tr.z;
    tr.z += ESC.TIRO_V * dt;
    if (tr.z < ESC.Z0) continue;   // todavia no salio (la rafaga sale escalonada)
    // EL CRUCE CON EL AVION: se juzga entre dos cuadros, como la bomba contra el casco
    if (!hit && !tr.fuera && tr.zPrev < PZ && tr.z >= PZ) {
      const p = tiroEn(tr, PZ, ESC.DIST, PZ, ESC.G);
      if (Math.abs(p.x - plane.x) < ESC.HIT_X && Math.abs(p.y - plane.y) < ESC.HIT_Y) { hit = true; tr.fuera = true; }
    }
    const p = tiroEn(tr, tr.z, ESC.DIST, PZ, ESC.G);
    if (p.y <= AGUA || tr.z > ESC.Z_MAX) {
      // CAE AL AGUA: el pique es lo que dibuja el carril — yendo derecho caen lejos y desparramados
      if (p.y <= AGUA && tr.z > PZ) { piqueAgua(p.x, AGUA, tr.z); escape.piques.push({ x: p.x, z: tr.z, zPrev: tr.z }); }
      tr.fuera = true;
    }
  }
  for (let i = escape.tiros.length - 1; i >= 0; i--) if (escape.tiros[i].fuera) escape.tiros.splice(i, 1);
  // EL HUMO Y EL AGUA: los piques quedan donde cayeron y se vienen encima con el mundo. Pasar por
  // uno reciente te tapa un instante — la solucion se congela.
  for (const pq of escape.piques) {
    pq.zPrev = pq.z; pq.z -= run.spd * dt;
    if (pq.zPrev >= PZ && pq.z < PZ && Math.abs(pq.x - plane.x) < ESC.HUMO_X) escape.congela = ESC.HUMO_T;
  }
  for (let i = escape.piques.length - 1; i >= 0; i--) if (escape.piques[i].z < 0) escape.piques.splice(i, 1);
  xAnt = plane.x;
  return hit ? 'hit' : entra ? 'vibora' : null;
}
