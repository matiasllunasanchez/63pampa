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
import { esTierraEn } from '../core/geografia.js';

const ROJO = ['#ff4a3a', [255, 70, 50]], VERDE = ['#4aff7a', [70, 255, 120]], BLANCO = ['#f4f8ff', [230, 240, 255]];
const AMBAR = ['#ffd890', [255, 200, 120]];
const CALIDA = ['#fff0d0', [255, 236, 200]];
const LEJOS = 900;   // mas alla, ni se dibujan

/** EL REBOTE EN EL AGUA (22/10, el autor: "y alumbran / iluminan el ambiente, que reboten bien"). Una luz
 *  sobre el mar se ve dos veces: ella, y su reflejo — una columna de rayitas que tiembla con las olas debajo
 *  de la superficie, del largo de lo alta que esta (el espejo del agua). Y alumbra: un charco de luz sobre el
 *  agua, justo abajo, que es el que abre la oscuridad de la noche ahi. En PANTALLA: `sx, sy` la luz, `ySup`
 *  la superficie debajo de ella, `k` la escala (F/z), `hex`/`rgb` el color, `a` la fuerza. */
export function reflejoLuz(sx, sy, ySup, k, hex, rgb, a) {
  const alto = ySup - sy;
  if (!(alto > 0.5) || !(a > 0.02)) return;
  const largo = Math.min(alto * 1.6, 60 + k * 4), ancho = Math.max(1, k * 0.6);
  ctx.save();
  for (let y = 0, i = 0; y < largo; y += Math.max(1, k * 0.35), i++) {
    const u = y / largo, temb = Math.sin(run.t * 7 + i * 1.9 + sx * 0.1) * (0.6 + u * 2) * Math.max(1, k * 0.25);
    const al = a * 0.55 * (1 - u) * (0.55 + 0.45 * Math.sin(run.t * 5.1 + i * 2.7));
    if (al < 0.02) continue;
    ctx.globalAlpha = Math.min(1, al);
    px(sx - ancho / 2 + temb, ySup + y, ancho * (0.6 + 0.6 * Math.abs(Math.sin(i * 3.1))), 1, hex);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  luz(ctx, sx, ySup + 1, Math.max(3, k * 1.4), rgb, Math.min(1, a * 0.2));     // el charco que alumbra (22/11: chico)
}
/** EL PUNTO DE LUZ, REDONDO (22/11, el autor: "las luces de los aviones en la noche son super cuadradas, mejorar").
 *  Antes era un `px` cuadrado de color pleno; ahora es un disco con el centro casi blanco (lo que quema la vista) y
 *  un resplandor corto alrededor, sumado ('lighter') como la luz de verdad. El halo ancho sigue saliendo de `luz()`.
 *  En PANTALLA: `x, y` el centro, `r` el radio del disco, `rgb` el color, `a` la fuerza. */
export function nucleoLuz(x, y, r, rgb, a) {
  if (!(a > 0.01)) return;
  const [R, G, B] = rgb, k = Math.min(1, a);
  const blanco = `rgba(${Math.round(R + (255 - R) * 0.75)},${Math.round(G + (255 - G) * 0.75)},${Math.round(B + (255 - B) * 0.75)},${k})`;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // (22/11, "solo luces mas chicas"): el resplandor propio, corto
  const rh = r * 2.2, g = ctx.createRadialGradient(x, y, 0, x, y, rh);
  g.addColorStop(0, `rgba(${R},${G},${B},${k * 0.45})`);
  g.addColorStop(0.3, `rgba(${R},${G},${B},${k * 0.15})`);
  g.addColorStop(1, `rgba(${R},${G},${B},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - rh, y - rh, rh * 2, rh * 2);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = `rgba(${R},${G},${B},${k})`;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = blanco;
  ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
/** ¿Hay mar debajo de (x, z)? (sobre tierra no hay reflejo: G1) */
const sobreAgua = (x, z) => !esTierraEn(x, run.dist + z);

/** Un punto de luz en el mundo (x, y, z) con su color; `r` del resplandor en metros, `a` su fuerza. */
function punto(x, y, z, [hex, rgb], r, a) {
  const p = proj(x, y, z), k = F / z;
  nucleoLuz(p.x, p.y, Math.max(0.7, k * 0.22), rgb, Math.min(1, a * 2));
  luz(ctx, p.x, p.y, Math.max(2.5, r * k * 0.55), rgb, Math.min(1, a * 0.45));   // (22/11: el halo, chico)
  if (y > 0.3 && sobreAgua(x, z)) reflejoLuz(p.x, p.y, proj(x, 0, z).y, k, hex, rgb, a);
}
/** EL AURA: un resplandor ancho y bajo alrededor del cuerpo, como si lo alumbraran sus propias luces —
 *  abre la oscuridad lo justo para que se lea la silueta (`m` = el medio tamaño del bicho, en metros). */
function aura(x, y, z, m, a) {
  return;   // (22/11, el autor: "todo tiene mucha luz… dejar solo luces mas chicas"): sin el aura del cuerpo
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
    case 'jet': break;   // (22/11, el autor: "los Harrier entiendo que no llevan nada"): sin luces
    case 'helo': {
      // las puntas de ala, dentro del dibujo: el sprite del caza y del Harrier mide 4,2 de ancho (render/enemies.js
      // ARTE), asi que la punta queda a ~1,9 del centro (19/10, el autor: "los harriers tienen las luces demasiado
      // lejos de las alas")
      const y = o.y != null ? o.y : gy + h, ala = o.type === 'jet' ? 1.9 : 3.2;
      aura(o.x, y, z, ala * 1.8, a);
      punto(o.x - ala, y, z, ROJO, 1.6, 0.55 * a);
      punto(o.x + ala, y, z, VERDE, 1.6, 0.55 * a);
      if (titila(ph)) punto(o.x, y + (o.type === 'jet' ? 0.4 : 0.9), z, BLANCO, 3.2, 0.9 * a);
      if (o.type === 'helo' && titila(ph + 2, 0.9)) punto(o.x, y - 0.8, z, ROJO, 2.2, 0.6 * a);   // la baliza de panza
      break;
    }
    case 'mast': case 'lcu': {
      const L = o.type === 'mast' ? 9 : 6, alto = o.type === 'mast' ? Math.max(h, 7) : Math.max(h * 0.6, 2.5);
      // (22/11, el autor: "pocas, mas tenues, no siempre rojas y verdes, combinalas; una roja arriba, variaban"):
      // la de tope ROJA (fija o latiendo, segun el barco), el par de los costados sorteado por barco, y de las tres
      // ventanas solo algunas prendidas — todo mas tenue
      const s = Math.abs(Math.floor(ph * 97)) >>> 0, b = a * 0.6;
      aura(o.x, gy + alto * 0.4, z, L * 0.6, b);
      // LA ANTENA (22/11, el autor: "a los barcos crearles una antena larga, alta, con luz roja chiquita"): un palo fino
      // por encima del tope, y arriba de todo la roja, chiquita (fija o latiendo segun el barco)
      // (23/11, el autor: "las barras de los barcos empiezan muy por encima del barco en los chicos: barritas muy cortitas
      // que arranquen desde el barco, no desde el aire"): nace del tope REAL del casco (`h`, no el `alto` minimo de las
      // luces) y es corta
      const tope = Math.max(0.8, h * 0.9);
      { const ant = Math.max(0.8, tope * 0.3), pb = proj(o.x, gy + tope, z), pt = proj(o.x, gy + tope + ant, z);
        ctx.save(); ctx.strokeStyle = '#46525a'; ctx.globalAlpha = Math.min(1, 0.4 + fuerza * 0.6);
        ctx.lineWidth = Math.max(0.5, F / z * 0.12); ctx.beginPath(); ctx.moveTo(pb.x, pb.y); ctx.lineTo(pt.x, pt.y); ctx.stroke(); ctx.restore();
        if (s % 2 || Math.sin(run.t * 1.6 + ph) > -0.2) punto(o.x, gy + tope + ant, z, ROJO, 1.2, 0.6 * b); }
      const par = [[ROJO, VERDE], [ROJO, CALIDA], [AMBAR, VERDE], [CALIDA, CALIDA], [ROJO, AMBAR]][s % 5];
      punto(o.x - L * 0.45, gy + 1.4, z, par[0], 2, 0.5 * b);
      punto(o.x + L * 0.45, gy + 1.4, z, par[1], 2, 0.5 * b);
      for (let i = 0; i < 3; i++) if ((s >> i) % 3) punto(o.x + (i - 1) * L * 0.25, gy + 2.2, z, (s >> (i + 3)) % 3 ? AMBAR : CALIDA, 1.4, 0.35 * b);
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
