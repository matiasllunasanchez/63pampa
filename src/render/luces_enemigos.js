// LAS LUCES DE LOS ENEMIGOS DE NOCHE Y EN LA NIEBLA (18/10/2026, el autor: "los enemigos en la noche o niebla
// deben tener algunas luces que iluminen para distinguirlos un poco").
//
// Lo que se prende es lo que llevaba cada cosa de verdad, y nada mas:
//   · lo que VUELA (helicopteros, cazas): las de navegacion —roja a la izquierda, verde a la derecha— y el
//     destello blanco anticolision que titila;
//   · los BUQUES (la fragata del mar abierto, la barcaza): la luz de tope en el palo, las de costado y unas
//     de cubierta;
//   · lo de TIERRA: la baliza roja del radar y del globo, los faros del camion, ventanas en el deposito, el
//     puesto y la carpa; el Rapier, apenas un piloto de la consola.
// Cada una es un pixel nitido mas un resplandor (`luz` de render/brillo.js): el resplandor es el que abre la
// oscuridad de la noche (render/noche.js la usa de mascara) y el que atraviesa la niebla. Se apagan con la
// distancia — de lejos serian ruido — y no hay nada que hacer de dia y sin niebla.
import { ctx, F, px } from './ctx.js';
import { proj } from '../core/fx.js';
import { run } from '../core/run.js';
import { luz } from './brillo.js';

const ROJO = ['#ff4a3a', [255, 70, 50]], VERDE = ['#4aff7a', [70, 255, 120]], BLANCO = ['#f4f8ff', [230, 240, 255]];
const AMBAR = ['#ffd890', [255, 200, 120]];
const LEJOS = 900;   // mas alla, ni se dibujan

/** Un punto de luz en el mundo (x, y, z) con su color; `r` del resplandor en metros, `a` su fuerza. */
function punto(x, y, z, [hex, rgb], r, a) {
  const p = proj(x, y, z), k = F / z;
  const t = Math.max(1.5, k * 0.5);
  ctx.globalAlpha = Math.min(1, a * 2);
  px(p.x - t / 2, p.y - t / 2, t, t, hex);
  ctx.globalAlpha = 1;
  luz(ctx, p.x, p.y, Math.max(5, r * k * 1.5), rgb, Math.min(1, a * 1.4));
}
/** EL AURA: un resplandor ancho y bajo alrededor del cuerpo, como si lo alumbraran sus propias luces —
 *  abre la oscuridad lo justo para que se lea la silueta (`m` = el medio tamaño del bicho, en metros). */
function aura(x, y, z, m, a) {
  const p = proj(x, y, z), k = F / z;
  luz(ctx, p.x, p.y, Math.max(8, m * k * 1.6), [200, 215, 230], 0.3 * a);
}
const titila = (ph, f = 1.3) => (Math.sin(run.t * f * 6.283 + ph) > 0.82 ? 1 : 0);

/** Las luces de un obstaculo `o` (los de spawn.js). `fuerza` 0..1: cuanto de noche o de niebla hay. */
export function lucesEnemigo(o, fuerza) {
  if (!(fuerza > 0.02) || !o || o.done || o.dead || !(o.z > 4) || o.z > LEJOS) return;
  const a = fuerza * Math.min(1, (LEJOS - o.z) / 300), z = o.z, ph = (o.x || 0) * 1.7 + (o.seed || 0);
  const gy = o.gy || 0, h = o.h || 3;
  switch (o.type) {
    case 'helo': case 'jet': {
      const y = o.y != null ? o.y : gy + h, ala = o.type === 'jet' ? 4.2 : 3.2;
      aura(o.x, y, z, ala * 1.6, a);
      punto(o.x - ala, y, z, ROJO, 1.6, 0.55 * a);
      punto(o.x + ala, y, z, VERDE, 1.6, 0.55 * a);
      if (titila(ph)) punto(o.x, y + 0.9, z, BLANCO, 3.2, 0.9 * a);
      if (o.type === 'helo' && titila(ph + 2, 0.9)) punto(o.x, y - 0.8, z, ROJO, 2.2, 0.6 * a);   // la baliza de panza
      break;
    }
    case 'mast': case 'lcu': {
      const L = o.type === 'mast' ? 9 : 6, alto = o.type === 'mast' ? Math.max(h, 7) : Math.max(h * 0.6, 2.5);
      aura(o.x, gy + alto * 0.4, z, L * 0.6, a);
      punto(o.x, gy + alto, z, BLANCO, 3, 0.8 * a);                                         // la de tope
      punto(o.x - L * 0.45, gy + 1.4, z, ROJO, 2, 0.5 * a);
      punto(o.x + L * 0.45, gy + 1.4, z, VERDE, 2, 0.5 * a);
      for (let i = 0; i < 3; i++) punto(o.x + (i - 1) * L * 0.25, gy + 2.2, z, AMBAR, 1.4, 0.35 * a);
      break;
    }
    case 'radar': case 'balloon': {
      const yb = o.type === 'balloon' ? (o.y != null ? o.y : gy + h) + 1.6 : gy + h + 0.3;
      aura(o.x, yb - 1.5, z, 2.5, a);
      if (Math.sin(run.t * 2 + ph) > 0.3) punto(o.x, yb, z, ROJO, 3, 0.75 * a);
      break;
    }
    case 'aatruck':
      aura(o.x, gy + 1.2, z, 3, a);
      for (const s of [-0.7, 0.7]) punto(o.x + s, gy + 0.9, z, AMBAR, 2.4, 0.55 * a);          // los faros
      break;
    case 'aa': case 'manpad':
      aura(o.x, gy + 1, z, 2.2, a);
      punto(o.x + 0.5, gy + 1.0, z, ROJO, 1.2, 0.4 * a);                                      // el piloto de la consola
      break;
    case 'depot': case 'bldg': case 'tent':
      aura(o.x, gy + h * 0.5, z, 3.5, a);
      for (let i = 0; i < 2; i++) if (((i + Math.floor(ph)) & 3) !== 0) punto(o.x + (i - 0.5) * 2.2, gy + h * 0.45, z, AMBAR, 1.8, 0.45 * a);
      break;
  }
}
