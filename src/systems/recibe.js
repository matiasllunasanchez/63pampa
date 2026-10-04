// EL RECIBIMIENTO — las ametralladoras del buque que te esperan y te erran (core/recibe.js).
//
// LO QUE HACE: mientras te acercas al blanco, el buque tira rafagas cortas hacia vos. Cada bala
// nace en algun punto de la eslora (con su fogonazo), viaja como trazadora y pica en el agua A TU
// ALREDEDOR — a los costados, adelante, nunca encima. Es la sensacion de entrar al fuego.
//
// LO QUE NO HACE: pegarte. No pasa por collision.js, no toca `run.integ`, no carga el radar. Si
// algun dia tiene que doler, es otro sistema: este existe para la adrenalina y nada mas.
import { plane } from '../core/state.js';
import { blanco, altoEn } from '../core/blanco.js';
import { recibe, resetRecibe } from '../core/recibe.js';
import { piqueMunicion } from '../core/fx.js';
import { BL } from '../data/blanco.js';
import { REC } from '../data/tuning.js';

const rnd = (a, b) => a + Math.random() * (b - a);

/** ¿Te estan tirando? Con el buque a la vista, en la aproximacion, y entero. Se corta en el cruce,
 *  en el negro, en el escape y si ya lo hundiste: un buque en llamas no apunta. */
function activo(negro, PZ) {
  if (!blanco.on || blanco.hundido || blanco.escapando || negro > 0 || blanco.perdidaT >= 0) return false;
  const d = blanco.z - PZ;
  return d > REC.D_MIN && d < REC.D_MAX;
}

/** Un cuadro. `negro` es blancoSys.negro(): en el negro no hay nada que ver ni que tirar. `PZ` entra
 *  por parametro, como en drawTirosPopa: es del render y los sistemas no lo importan. */
export function stepRecibe(dt, negro, PZ) {
  if (!blanco.on) { if (recibe.tiros.length || recibe.destellos.length) resetRecibe(); return; }
  // las que ya salieron terminan su vuelo aunque se haya cortado el fuego: una bala no se borra
  for (let i = recibe.tiros.length - 1; i >= 0; i--) {
    const tr = recibe.tiros[i];
    tr.t += dt;
    if (tr.t >= tr.T) { piqueMunicion(tr.dx, tr.dz, 'trazadora'); recibe.tiros.splice(i, 1); }
  }
  for (let i = recibe.destellos.length - 1; i >= 0; i--) {
    if ((recibe.destellos[i].t -= dt) <= 0) recibe.destellos.splice(i, 1);
  }
  if (!activo(negro, PZ)) return;
  // LAS RAFAGAS: mas seguidas cuanto mas cerca, que es lo que hace subir la tension sola
  const d = blanco.z - PZ;
  const cerca = 1 - Math.max(0, Math.min(1, (d - REC.D_MIN) / (REC.D_MAX - REC.D_MIN)));
  recibe.rafT -= dt;
  if (recibe.rafT > 0) return;
  recibe.rafT = rnd(...REC.CADA) * (1 - 0.6 * cerca);
  // UN PUESTO DE LA ESLORA por rafaga: el fogonazo y las balas salen del mismo lugar, asi el ojo
  // encuentra de donde vienen
  const ex = BL.X + rnd(-0.4, 0.4) * BL.LEN, h = Math.max(1, altoEn(ex));
  const ey = blanco.base + h * rnd(0.3, 0.7);
  const n = Math.round(rnd(...REC.BALAS));
  // EL LADO DE LA RAFAGA: o te pasa por la izquierda o por la derecha, y camina un poco
  const lado = Math.random() < 0.5 ? -1 : 1;
  for (let i = 0; i < n; i++) {
    // `t` arranca NEGATIVO: es la demora de cada bala dentro de la rafaga (el render no dibuja t < 0)
    const T = Math.max(REC.T_MIN, Math.min(REC.T_MAX, d / REC.V));
    // ROZANDO (4/10, el autor: "tienen que ir cerca del avion, como si pasaran rozando"): la mayoria
    // baja hasta tu altura pegada a tu costado y pica apenas delante tuyo; el resto se clava en el agua
    // cerca o lejos. Nunca menos de ROZA[0] de costado: rozar, no pegar.
    if (Math.random() < REC.ROZAN) {
      const dx = plane.x + lado * rnd(...REC.ROZA) + i * lado * 0.3;
      const dy = Math.max(0.5, plane.y + rnd(-1.2, 1.8));
      // (y terminan ADELANTE tuyo, no atras: el autor 4/10, "deben verse mas adelante del avion, para
      // que se vean pasar" — atras las tapaba la camara. Al llegar pican, asi el efecto queda a la vista)
      recibe.tiros.push({ ox: ex, oy: ey, oz: blanco.z, dx, dy, dz: PZ + rnd(...REC.ROZA_Z), t: -i * REC.ENTRE, T });
    } else {
      // …y alguna se va LEJOS (el autor: "la mayoria, no todas"): si todas rozan, el tiro parece guiado
      const lejos = Math.random() < REC.LEJOS;
      const dx = plane.x + lado * (lejos ? rnd(...REC.LEJOS_X) : rnd(REC.ERRA_MIN, REC.ERRA_MAX)) + i * lado * 0.5;
      recibe.tiros.push({ ox: ex, oy: ey, oz: blanco.z, dx, dy: 0, dz: PZ + rnd(...(lejos ? REC.LEJOS_Z : REC.PICA_Z)), t: -i * REC.ENTRE, T });
    }
  }
  // OTRA TANDA, MAS ADELANTE (4/10, el autor): la misma rafaga sigue y estas pican mas lejos delante
  // tuyo, cerca de tu linea — el agua se ve picada por delante y uno vuela hacia los piques.
  const m = Math.round(rnd(...REC.MAS_N));
  for (let j = 0; j < m; j++) {
    const i = n + j, T = Math.max(REC.T_MIN, Math.min(REC.T_MAX, d / REC.V));
    const dx = plane.x + (Math.random() < 0.5 ? -1 : 1) * rnd(...REC.MAS_X);
    recibe.tiros.push({ ox: ex, oy: ey, oz: blanco.z, dx, dy: 0, dz: PZ + rnd(...REC.MAS_Z), t: -i * REC.ENTRE, T });
  }
  const dura = REC.DESTELLO_T + (n + m) * REC.ENTRE;
  recibe.destellos.push({ x: ex, y: ey, t: dura, T: dura });
  if (recibe.tiros.length > REC.MAX) recibe.tiros.splice(0, recibe.tiros.length - REC.MAX);
}
