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
  escape.rafT = 0.4;   // la primera rafaga llega apenas bajas del salto
}

export function terminar() { resetEscape(); }
/** Un derribo durante el escape: lo que estaba en el aire no se hereda (morir dos veces). */
export function limpiar() { escape.tiros.length = 0; }

/** ¿Estas mostrando la panza? Fuera del carril, o alabeado, o en una pirueta. */
export const panza = () => Math.abs(plane.x - escape.carrilX) > ESC.CARRIL
  || Math.abs(plane.bank || 0) > ESC.BANK_PANZA || !!run.mv;

export function step(dt) {
  if (!escape.on) return null;
  escape.t += dt;
  escape.panza = panza();
  // EL SALTO TE DEJA ALTO UN RATO: sin la gracia, el techo a 6 completaba la barra del radar en el
  // cuadro del cruce y la oleada de misiles pegaba antes de que pudieras bajar (medido en V0).
  if (escape.t < ESC.GRACIA) run.detection = Math.min(run.detection, 0.9);
  // LAS RAFAGAS de popa, mientras dura la linea recta. Cada tiro elige su punto de mira alrededor
  // de donde ESTAS: con la panza a la vista la campana se cierra.
  if (escape.t < ESC.RECTA_T) {
    escape.rafT -= dt;
    if (escape.rafT <= 0) {
      escape.rafT = ESC.RAFAGA_CADA * (0.8 + Math.random() * 0.4);
      const s = escape.panza ? ESC.SIGMA_PANZA : ESC.SIGMA_RECTA;
      for (let i = 0; i < ESC.POR_RAFAGA; i++) {
        escape.tiros.push({
          ox: escape.carrilX + (Math.random() - 0.5) * 6, oy: AGUA + 1.5,
          ax: plane.x + gauss(s), ay: Math.max(AGUA + 0.5, plane.y + gauss(s * 0.7)),
          z: ESC.Z0 - i * 5, zPrev: ESC.Z0 - i * 5,
        });
      }
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
      if (p.y <= AGUA && tr.z > PZ) piqueAgua(p.x, AGUA, tr.z);
      tr.fuera = true;
    }
  }
  for (let i = escape.tiros.length - 1; i >= 0; i--) if (escape.tiros[i].fuera) escape.tiros.splice(i, 1);
  return hit ? 'hit' : null;
}

