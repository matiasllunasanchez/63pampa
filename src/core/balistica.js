// LA TRAYECTORIA DE LO QUE SE SUELTA — la mira de bombardeo (pedido del autor 27/9: "una
// trayectoria desde el avion hacia donde caera la bomba, o los tanques si los tiro").
//
// PURO: recibe como sale el proyectil y devuelve el camino. Integra EXACTAMENTE lo mismo que
// systems/collision.js (el techo relativo con su `extra`, el planeo de la gravedad, la deriva): una
// mira que calculara otra cosa mentiria justo en el momento en que se la mira.
//
// EN EL MARCO DEL MUNDO, y es la decision que hace que sirva. collision.js mueve la bomba relativa a
// la CAMARA (el mundo viene hacia vos a `spd`); asi, el punto donde va a caer se veria donde va a
// estar la bomba, no lo que va a tocar. Sumandole lo que avanza el mundo mientras cae (`spd * t`),
// cada punto queda sobre el mundo que se ve AHORA — y la marca del final cae arriba de lo que le va a
// pegar. Supone que seguis a la misma velocidad; si frenas o aceleras despues, la bomba no se entera.
import { BOMBA_G, BOMBA_PLANEO, BOMBA_REL_MAX, SPAWN_Z } from '../data/tuning.js';
import { blanco, altoEn, AGUA } from './blanco.js';

/** El camino de un proyectil que sale con `b` = { x, y, z, vz, vy, vx, extra } y el mundo a `spd`.
 *  `suelo` es la altura contra la que detona (1 sobre agua, 0.3 en tierra, como collision.js).
 *  Devuelve { pts: [{x,y,z}], fin: {x,y,z}, buque } — `buque` si el final es el casco de la suelta. */
export function trayectoria(b, spd, suelo) {
  const dt = 1 / 60, pts = [];
  let x = b.x, y = b.y, z = b.z, vy = b.vy, t = 0, zw = b.z;
  for (let i = 0; i < 360; i++) {
    const zwAntes = zw;
    t += dt;
    z += Math.min(BOMBA_REL_MAX + (b.extra || 0), b.vz - spd) * dt;
    vy -= BOMBA_G * Math.min(1, t / BOMBA_PLANEO) * dt; y += vy * dt;
    x += (b.vx || 0) * dt;
    zw = z + spd * t;
    if (i % 3 === 0) pts.push({ x, y, z: zw });
    // el casco: se cruza en el marco del mundo contra donde esta el buque AHORA
    if (blanco.on && zwAntes < blanco.z && zw >= blanco.z) {
      const h = altoEn(x);
      if (h >= 0 && y <= AGUA + h) return { pts, fin: { x, y, z: blanco.z }, buque: true };
    }
    if (y <= suelo) return { pts, fin: { x, y: suelo, z: zw }, buque: false };
    if (zw > SPAWN_Z * 3) break;
  }
  return { pts, fin: null, buque: false };
}
