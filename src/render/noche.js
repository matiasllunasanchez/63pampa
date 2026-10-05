// LA NOCHE — todo oscuro, y lo que brilla ilumina (pedido del autor 4/10/2026, con capturas de una
// cabina de noche: "TODO OSCURO, ver el horizonte y algunas zonas con luces, los controles como en la
// imagen, y que los misiles, las balas y demas ILUMINEN el juego; que la LUNA ilumine dependiendo de
// si esta o no… algo de luna, no como el sol, que quiza refleje un poco").
//
// COMO. No hay luces "de verdad" en un juego 2D: hay una CAPA DE OSCURIDAD encima del mundo, y la
// capa de luz que ya existe (render/brillo.js: cada explosion, llama, fogonazo, bala y misil emite la
// suya con `luz()`) se usa como MASCARA — donde hay luz, la oscuridad se abre. Despues el resplandor
// se pega como siempre, mas fuerte: de noche la luz es todo lo que se ve.
//
//   noche sin luna / tormenta   casi negro, el horizonte apenas mas claro, luces sueltas a lo lejos
//   luna                        un azul tenue en vez de negro, y el reflejo de la luna en el agua
//
// El tablero va aparte (`tableroNoche`): los instrumentos se ven como en la foto, en ambar y oscuros.
import { cv, ctx, W, H, HOR, F, px } from './ctx.js';
import { cam, cfg, S } from '../core/state.js';
import { geoActiva, esTierraEn } from '../core/geografia.js';
import { run } from '../core/run.js';
import { capaLuz, luz } from './brillo.js';
import { NOCHE } from '../data/noche.js';

/** Que noche hace con el cielo `sky` (null = de dia, no se oscurece nada). */
export const nocheDe = sky => NOCHE.CIELOS[sky] || null;
export const esNoche = sky => !!nocheDe(sky);

let D = null, gd = null;
function lienzo() {
  if (D && D.width === cv.width && D.height === cv.height) return;
  D = document.createElement('canvas'); D.width = cv.width; D.height = cv.height; gd = D.getContext('2d');
}

// LAS LUCES LEJANAS: puntos sueltos sobre el horizonte —un pueblo en la costa, un buque, una boya—
// que se corren con la camara como lo lejano (poco). Se sortean UNA vez y viven toda la corrida.
const lejanas = [];
function sortearLejanas() {
  lejanas.length = 0;
  for (let i = 0; i < NOCHE.LEJANAS; i++) {
    const r = Math.random();
    lejanas.push({
      x: (Math.random() * 2 - 1) * 700, dy: Math.random() * 2.5,
      c: r < 0.62 ? [255, 190, 110] : r < 0.82 ? [255, 236, 190] : r < 0.93 ? [120, 230, 140] : [255, 90, 70],
      parpa: Math.random() < 0.3, ph: Math.random() * 6.3, g: 0.6 + Math.random() * 0.8,
    });
  }
}

/** LA NOCHE, encima del mundo y ANTES del resplandor y del HUD. `n` es `nocheDe(cfg.sky)`; `astro`
 *  la posicion en pantalla de la luna (o null); `giro` = { a, cx, cy } el giro del horizonte (o null):
 *  todo lo que esta EN el mundo —la franja clara del horizonte, las luces lejanas, el reflejo— rola
 *  con el (4/10, el autor: "si doblo, las luces se giran"). */
export function drawNoche(n, astro, giro) {
  if (!n) return;
  lienzo();
  if (!lejanas.length) sortearLejanas();
  const sx = cv.width / W, sy = cv.height / H;
  gd.setTransform(1, 0, 0, 1, 0, 0);
  gd.globalCompositeOperation = 'copy';
  // LA OSCURIDAD, con el horizonte un pelo mas claro: es lo unico que se tiene que seguir leyendo
  const [r, g, b] = n.rgb, a = n.a;
  const hy = HOR * sy;
  const gr = gd.createLinearGradient(0, 0, 0, D.height);
  gr.addColorStop(0, `rgba(${r},${g},${b},${a})`);
  gr.addColorStop(Math.max(0, hy / D.height - 0.05), `rgba(${r},${g},${b},${a * n.horiz})`);
  gr.addColorStop(hy / D.height, `rgba(${r},${g},${b},${a * n.horiz * 0.97})`);
  gr.addColorStop(Math.min(1, hy / D.height + 0.12), `rgba(${r},${g},${b},${a})`);
  gr.addColorStop(1, `rgba(${r},${g},${b},${Math.min(1, a * 1.04)})`);
  gd.fillStyle = gr;
  if (giro) {
    // el degradado se arma en pantalla y se gira alrededor del mismo centro que el mundo; el
    // rectangulo se agranda para que al girar no queden esquinas sin oscuridad
    gd.save();
    gd.translate(giro.cx * sx, giro.cy * sy); gd.rotate(giro.a); gd.translate(-giro.cx * sx, -giro.cy * sy);
    gd.fillRect(-D.width, -D.height, D.width * 3, D.height * 3);
    gd.restore();
  } else gd.fillRect(0, 0, D.width, D.height);
  // …Y LA LUZ LA ABRE: la capa de brillo del cuadro, como mascara (dos pasadas: el centro de una
  // explosion queda limpio y el borde en penumbra)
  const L = capaLuz();
  if (L) {
    gd.globalCompositeOperation = 'destination-out';
    gd.imageSmoothingEnabled = true;
    for (let i = 0; i < NOCHE.ABRE; i++) gd.drawImage(L, 0, 0, D.width, D.height);
  }
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(D, 0, 0);
  ctx.restore();
  // LO QUE ESTA EN EL MUNDO rola con el horizonte (el mismo giro que game.js le aplica al mundo)
  ctx.save();
  if (giro) { ctx.translate(giro.cx, giro.cy); ctx.rotate(giro.a); ctx.translate(-giro.cx, -giro.cy); }
  // (el REFLEJO DE LA LUNA ya no va aca: va DEBAJO de los aviones — ver `drawReflejoLuna`)
  // LAS LUCES LEJANAS, encima de la oscuridad: puntos chicos y nitidos con un halo minimo
  ctx.save();
  for (const l of lejanas) {
    const x = W / 2 + (l.x - cam.x * 0.25) * 0.45;
    if (x < -4 || x > W + 4) continue;
    const y = HOR + l.dy;
    let al = n.lejanas;
    if (l.parpa) al *= 0.35 + 0.65 * Math.max(0, Math.sin(run.t * 2.2 + l.ph));
    const [cr, cg, cb] = l.c;
    ctx.globalAlpha = al * 0.25;
    px(x - l.g, y - l.g, 2 * l.g, 2 * l.g, `rgb(${cr},${cg},${cb})`);
    ctx.globalAlpha = al;
    px(x - 0.5, y - 0.5, 1, 1, `rgb(${Math.min(255, cr + 40)},${Math.min(255, cg + 40)},${Math.min(255, cb + 40)})`);
  }
  ctx.restore();
  ctx.restore();   // el giro
}

/** EL REFLEJO DE LA LUNA en el agua: una columna que tiembla debajo del astro, hecha de rayas.
 *
 *  VA CON EL MUNDO, DEBAJO DE LOS AVIONES (autor, 4/10: "la luna se ve por encima del avion, y el
 *  reflejo nunca cambia, esta fijo"). Antes se pintaba despues de la oscuridad, encima de todo — el
 *  avion incluido — y sobre cualquier suelo: en el despegue la columna bajaba por la PISTA. Ahora:
 *    · se llama con el agua (game.js, despues de la estela) y lo que vuela la tapa;
 *    · cada raya pregunta si en ESE punto hay agua (G1): sobre tierra no hay reflejo;
 *    · la oscuridad de la noche la cubre despues, asi que se pinta mas fuerte en la cuenta exacta
 *      (1 / (1 − a)) para quedar con el mismo brillo que tenia encima.
 *  `astro` = la luna en pantalla. El giro del horizonte ya lo trae el contexto del mundo. */
export function drawReflejoLuna(n, astro) {
  if (!n || !n.luna || !astro || astro.x < -40 || astro.x > W + 40) return;
  if (S.state === 'takeoff' || S.state === 'landing') return;      // la pista no refleja
  const kOsc = 1 / Math.max(0.15, 1 - n.a);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let y = HOR + 2, i = 0; y < H; y += 2, i++) {
    // ¿hay agua en esta raya? la profundidad sale de invertir la proyeccion sobre el suelo (h = 0)
    const z = F * cam.y / Math.max(0.5, y - HOR);
    const wx = cam.x + (astro.x - W / 2) * z / F;
    const seco = geoActiva() ? esTierraEn(wx, run.dist + z) : cfg.terrain === 'land';
    if (seco) continue;
    const u = (y - HOR) / (H - HOR);
    const ancho = 3 + u * 26, temb = Math.sin(run.t * 3 + i * 1.7) * (1 + u * 5);
    const al = Math.min(1, NOCHE.REFLEJO * kOsc * (1 - u * 0.75) * (0.55 + 0.45 * Math.sin(run.t * 5.3 + i * 2.9)));
    if (al <= 0.02) continue;
    ctx.globalAlpha = al;
    px(astro.x - ancho / 2 + temb, y, ancho * (0.4 + 0.6 * Math.abs(Math.sin(i * 7.1))), 1, '#e4e8ee');
  }
  ctx.restore();
}

/** UNA LUZ SOLO DE NOCHE: las balas, los misiles y lo que de dia no hace falta que derrame (con
 *  sol, su halo lavaria el cuadro). Misma firma que `luz` de render/brillo.js. */
export function luzNoche(c, x, y, r, rgb, a) {
  if (nocheDe(cfg.sky)) luz(c, x, y, r, rgb, a);
}

/** Cada corrida nueva sortea sus luces lejanas. */
export function resetNoche() { lejanas.length = 0; }

/** EL TABLERO DE NOCHE: los instrumentos retroiluminados en AMBAR, como en la foto de la cabina. Se
 *  aplica DESPUES de dibujar el HUD, en `multiply` sobre las zonas del tablero: lo blanco queda ambar,
 *  lo gris queda casi negro, y el mundo que se ve entre reloj y reloj (ya oscuro) no cambia. Recibe
 *  las zonas en la grilla de DISEÑO (el HUD se dibuja con `ctx.scale(U)`). */
export function tableroNoche(n, zonas) {
  if (!n) return;
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = n.tablero;
  for (const z of zonas) ctx.fillRect(z.x, z.y, z.w, z.h);
  ctx.restore();
}
