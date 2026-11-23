// LA VIDA DEL FONDO (21/11/2026, el autor despues de jugar el tutorial: "fondo con mas vida: pajaros volando a
// lo lejos, de vez en cuando un avion lejano; de noche alguna estrella fugaz, algun satelite, o rara vez algo
// desconocido (luz extraña). Todo chico, lejano, decorativo, sin colision").
//
// DECORADO PURO: no es una entidad del juego (no esta en `obstacles`, no choca, no la ve el radar, no la
// registra ningun sistema). Vive aca adentro, con un pool fijo de cada cosa, sorteado al aparecer — por
// cuadro no se aloca nada. El reloj es `run.t`: con la pausa se queda quieto todo.
//
//   DE DIA   (drawVidaDia, entre las capas de nubes — render/nubes_cielo.js): bandadas cerca del horizonte y,
//            de vez en cuando, un avion alto con su estela de condensacion.
//   DE NOCHE (drawVidaNoche, DESPUES de la oscuridad — render/noche.js; abajo de ella no se veria): estrellas
//            fugaces, un satelite, las luces de navegacion del avion lejano y, casi nunca, LA LUZ EXTRAÑA.
//
// Los tiempos y tamaños, en data/cielo.js VIDA_CIELO.
import { ctx, W, HOR, px, pxFino } from './ctx.js';
import { theme } from './theme.js';
import { cam, cfg } from '../core/state.js';
import { run } from '../core/run.js';
import { NOCHE } from '../data/noche.js';
import { VIDA_CIELO as V } from '../data/cielo.js';

const rnd = (a, b) => a + Math.random() * (b - a);
const esNoche = () => !!NOCHE.CIELOS[cfg.sky];
const PAR_LEJOS = 0.25;      // lo del cielo se corre poco con la camara: esta lejisimos (como las luces lejanas)

// ---- los pools ----
const MAXP = 8;
const bandadas = Array.from({ length: 3 }, () => ({ on: false, x: 0, y: 0, vx: 0, n: 0, esc: 1, capa: 'lejos', ale: 4,
  dx: new Float32Array(MAXP), dy: new Float32Array(MAXP), ph: new Float32Array(MAXP) }));
const avion = { on: false, x: 0, y: 0, vx: 0, estela: 0, largo: 0, ph: 0 };
const fugaces = Array.from({ length: 2 }, () => ({ on: false, x: 0, y: 0, vx: 0, vy: 0, t: 0, vida: 0 }));
const sat = { on: false, x: 0, y: 0, vx: 0, vy: 0, t: 0, flash: -1 };
// LA LUZ EXTRAÑA: quieta, unos saltos secos de un lugar a otro, y se va de golpe
const raro = { on: false, x: 0, y: 0, t: 0, fase: 0, quieta: 0, saltos: 0, desdeX: 0, desdeY: 0, haciaX: 0, haciaY: 0, tSalto: 0, col: 0 };

// cuando toca la proxima de cada cosa (en run.t)
const prox = { pajaros: 3, avion: 20, fugaz: 4, sat: 12, raro: 60 };
let tPrev = -1;
let cieloPintado = false;     // drawVidaNoche solo dibuja si este cuadro se pinto el cielo 2D (ver pasoVida)

function reprogramar(t) {
  prox.pajaros = t + rnd(V.PAJAROS.cada[0] * 0.3, V.PAJAROS.cada[1] * 0.5);
  prox.avion = t + rnd(V.AVION.cada[0] * 0.4, V.AVION.cada[1]);
  prox.fugaz = t + rnd(V.FUGAZ.cada[0] * 0.5, V.FUGAZ.cada[1]);
  prox.sat = t + rnd(V.SATELITE.cada[0] * 0.5, V.SATELITE.cada[1]);
  prox.raro = t + rnd(V.RARO.cada[0], V.RARO.cada[1]);
}

/** Una bandada nueva, entrando por un costado. */
function nuevaBandada(b) {
  const P = V.PAJAROS, dir = Math.random() < 0.5 ? -1 : 1;
  const cerca = Math.random() < P.cerca;
  b.on = true; b.esc = cerca ? 2 : 1; b.capa = cerca ? 'sol' : 'lejos';
  b.vx = dir * rnd(P.vel[0], P.vel[1]) * (cerca ? 1.8 : 1);
  b.x = cam.x * PAR_LEJOS + (dir > 0 ? -30 : W + 30);
  b.y = HOR - rnd(P.y[0], P.y[1]) * (cerca ? 1.6 : 1);
  b.n = Math.min(MAXP, Math.round(rnd(P.n[0], P.n[1])));
  b.ale = rnd(P.aleteo[0], P.aleteo[1]);
  // EN V (la mitad de las veces) o suelta
  const enV = Math.random() < 0.5, sep = cerca ? 5 : 3;
  for (let i = 0; i < b.n; i++) {
    if (enV) { const lado = i % 2 ? 1 : -1, fila = (i + 1) >> 1; b.dx[i] = -dir * fila * sep; b.dy[i] = lado * fila * sep * 0.45; }
    else { b.dx[i] = rnd(-4, 4) * sep; b.dy[i] = rnd(-2, 2) * sep * 0.6; }
    b.ph[i] = Math.random() * 1.2;   // (la bandada aletea casi a la par: desfasados al azar titilaban como murcielagos)
  }
}

/** Avanza todo y saca lo que toca. Lo llama render/nubes_cielo.js UNA vez por cuadro, con el cielo 2D. */
export function pasoVida() {
  const t = run.t;
  if (tPrev < 0 || t < tPrev - 0.5) reprogramar(t);          // corrida nueva (el reloj volvio atras)
  const dt = Math.max(0, Math.min(0.1, t - (tPrev < 0 ? t : tPrev)));
  tPrev = t;
  cieloPintado = true;
  const noche = esNoche(), tormenta = cfg.sky === 'storm';
  // ---- de dia ----
  if (t >= prox.pajaros) {
    prox.pajaros = t + rnd(V.PAJAROS.cada[0], V.PAJAROS.cada[1]);
    if (!noche && !tormenta) { const b = bandadas.find(q => !q.on); if (b) nuevaBandada(b); }
  }
  for (const b of bandadas) {
    if (!b.on) continue;
    b.x += b.vx * dt;
    const sx = b.x - cam.x * PAR_LEJOS;
    if ((b.vx > 0 && sx > W + 60) || (b.vx < 0 && sx < -60)) b.on = false;
  }
  if (t >= prox.avion) {
    prox.avion = t + rnd(V.AVION.cada[0], V.AVION.cada[1]);
    if (!avion.on && !tormenta) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      avion.on = true; avion.vx = dir * rnd(V.AVION.vel[0], V.AVION.vel[1]);
      avion.x = cam.x * PAR_LEJOS + (dir > 0 ? -20 : W + 20);
      avion.y = HOR - rnd(V.AVION.y[0], V.AVION.y[1]);
      avion.estela = Math.random() < V.AVION.estela ? 1 : 0;
      avion.largo = rnd(V.AVION.largo[0], V.AVION.largo[1]); avion.ph = Math.random() * 3;
    }
  }
  if (avion.on) {
    avion.x += avion.vx * dt;
    const sx = avion.x - cam.x * PAR_LEJOS;
    if ((avion.vx > 0 && sx > W + 40 + avion.largo) || (avion.vx < 0 && sx < -40 - avion.largo)) avion.on = false;
  }
  // ---- de noche ----
  if (t >= prox.fugaz) {
    prox.fugaz = t + rnd(V.FUGAZ.cada[0], V.FUGAZ.cada[1]);
    const f = noche && !tormenta && fugaces.find(q => !q.on);
    if (f) {
      const ang = rnd(0.35, 0.8), dir = Math.random() < 0.5 ? -1 : 1, v = rnd(V.FUGAZ.vel[0], V.FUGAZ.vel[1]);
      f.on = true; f.t = 0; f.vida = rnd(V.FUGAZ.vida[0], V.FUGAZ.vida[1]);
      f.x = rnd(20, W - 20) + cam.x * PAR_LEJOS; f.y = rnd(4, HOR - 40);
      f.vx = Math.cos(ang) * v * dir; f.vy = Math.sin(ang) * v;
    }
  }
  for (const f of fugaces) if (f.on && (f.t += dt) > f.vida) f.on = false;
  if (t >= prox.sat) {
    prox.sat = t + rnd(V.SATELITE.cada[0], V.SATELITE.cada[1]);
    if (noche && !tormenta && !sat.on) {
      const dir = Math.random() < 0.5 ? -1 : 1, v = rnd(V.SATELITE.vel[0], V.SATELITE.vel[1]);
      sat.on = true; sat.t = 0;
      sat.x = cam.x * PAR_LEJOS + (dir > 0 ? -10 : W + 10); sat.y = rnd(6, HOR - 45);
      sat.vx = dir * v; sat.vy = rnd(-0.12, 0.12) * v;
      sat.flash = Math.random() < V.SATELITE.destello ? rnd(0.3, 0.7) * (W + 20) / v : -1;
    }
  }
  if (sat.on) {
    sat.t += dt; sat.x += sat.vx * dt; sat.y += sat.vy * dt;
    const sx = sat.x - cam.x * PAR_LEJOS;
    if (sx < -20 || sx > W + 20 || sat.y < -5 || sat.y > HOR - 20) sat.on = false;
  }
  if (t >= prox.raro) {
    prox.raro = t + rnd(V.RARO.cada[0], V.RARO.cada[1]);
    if (noche && !tormenta && !raro.on && Math.random() < V.RARO.chance) {
      raro.on = true; raro.t = 0; raro.fase = 0;
      raro.x = rnd(60, W - 60) + cam.x * PAR_LEJOS; raro.y = HOR - rnd(22, 50);
      raro.quieta = rnd(V.RARO.quieta[0], V.RARO.quieta[1]);
      raro.saltos = Math.round(rnd(V.RARO.saltos[0], V.RARO.saltos[1]));
      raro.col = Math.random() < 0.5 ? 0 : 1;
    }
  }
  if (raro.on) pasoRaro(dt);
}

// LA LUZ EXTRAÑA, por fases: 0 aparece y se queda · 1 salta (0,15 s de un punto a otro) y se queda un rato ·
// 2 se va: acelera en diagonal hacia arriba y se apaga
function pasoRaro(dt) {
  raro.t += dt;
  if (raro.fase === 0 && raro.t > raro.quieta) saltar();
  else if (raro.fase === 1) {
    const u = Math.min(1, (raro.t - raro.tSalto) / 0.15);
    raro.x = raro.desdeX + (raro.haciaX - raro.desdeX) * u;
    raro.y = raro.desdeY + (raro.haciaY - raro.desdeY) * u;
    if (raro.t - raro.tSalto > 0.15 + raro.quieta * 0.35) { if (raro.saltos > 0) saltar(); else { raro.fase = 2; raro.tSalto = raro.t; raro.haciaX = Math.random() < 0.5 ? -1 : 1; } }
  } else if (raro.fase === 2) {
    const u = raro.t - raro.tSalto;
    raro.x += raro.haciaX * (40 + u * 900) * dt; raro.y -= (20 + u * 400) * dt;
    if (u > 0.8) raro.on = false;
  }
}
function saltar() {
  raro.fase = 1; raro.saltos--; raro.tSalto = raro.t;
  raro.desdeX = raro.x; raro.desdeY = raro.y;
  raro.haciaX = raro.x + rnd(18, 50) * (Math.random() < 0.5 ? -1 : 1);
  raro.haciaY = Math.max(10, Math.min(HOR - 18, raro.y + rnd(-14, 14)));
}

/** Lo de dia de la capa de nubes `capa` (se llama despues de cada capa: lo lejano queda detras de las
 *  nubes de adelante). Los pajaros lejanos van con la capa 'lejos', los cercanos con 'sol'; el avion con
 *  'cirro'. */
export function drawVidaDia(capa) {
  if (esNoche()) return;
  const sk = theme.sky;
  for (const b of bandadas) {
    if (!b.on || b.capa !== capa) continue;
    const bx = b.x - cam.x * PAR_LEJOS;
    ctx.globalAlpha = b.esc > 1 ? 0.85 : 0.6;
    ctx.fillStyle = b.esc > 1 ? '#20262c' : (sk.skyMid ? mezclaOsc(sk.skyMid) : '#3a4048');
    for (let i = 0; i < b.n; i++) {
      // EL ALETEO en tres cuadros: alas arriba (una V), extendidas (una raya), abajo (una A chata)
      // …y PLANEAN (V.PAJAROS.planeo del tiempo): unos aletazos y las alas quietas, extendidas
      const planea = Math.sin(run.t * 0.55 + b.ph[i] * 0.5 + b.ale) < V.PAJAROS.planeo * 2 - 1;
      const a = planea ? 0 : Math.sin(run.t * b.ale * 6.28 + b.ph[i]);
      const x = Math.round(bx + b.dx[i]), y = Math.round(b.y + b.dy[i] + Math.sin(run.t * 1.3 + b.ph[i]) * 0.8);
      const e = b.esc, alaY = a > 0.35 ? -e : a < -0.35 ? e * 0.5 : 0;
      ctx.fillRect(x, y, e, e);                                  // el cuerpo
      ctx.fillRect(x - e, y + alaY, e, e); ctx.fillRect(x + e, y + alaY, e, e);
      if (e > 1) { ctx.fillRect(x - 2 * e, y + alaY * 1.6, e, e * 0.5); ctx.fillRect(x + 2 * e, y + alaY * 1.6, e, e * 0.5); }
    }
  }
  if (capa === 'cirro' && avion.on) {
    const x = avion.x - cam.x * PAR_LEJOS, y = avion.y, dir = Math.sign(avion.vx);
    // LA ESTELA de condensacion: una raya fina detras, que se abre y se apaga hacia atras
    if (avion.estela) {
      for (let s = 0; s < 8; s++) {
        const u0 = s / 8, l = avion.largo / 8;
        ctx.globalAlpha = 0.5 * (1 - u0);
        pxFino(dir > 0 ? x - 2 - (s + 1) * l : x + 2 + s * l, y + u0 * 0.5, l + 0.5, 0.5 + u0, '#f2f4f6');
      }
    }
    ctx.globalAlpha = 0.85;
    pxFino(x - 1.5, y, 3, 0.5, '#2a3036');                   // el fuselaje
    pxFino(x - 0.25 + dir * 0.25, y - 0.5, 0.5, 1.5, '#2a3036');   // las alas, de canto
  }
  ctx.globalAlpha = 1;
}
let ultMid = '', ultOsc = '';
function mezclaOsc(c) {
  if (c === ultMid) return ultOsc;
  const v = [1, 3, 5].map(i => Math.round(parseInt(c.slice(i, i + 2), 16) * 0.45));
  ultMid = c; ultOsc = `rgb(${v[0]},${v[1]},${v[2]})`;
  return ultOsc;
}

/** Lo de noche, ENCIMA de la oscuridad (render/noche.js, adentro del giro del horizonte). Solo si este cuadro
 *  se pinto el cielo 2D: en el climax 3D el horizonte es otro y esto quedaria flotando. */
export function drawVidaNoche() {
  if (!cieloPintado) return;
  cieloPintado = false;
  const t = run.t;
  // ESTRELLAS FUGACES: la cabeza blanca y una cola que se apaga hacia atras
  for (const f of fugaces) {
    if (!f.on) continue;
    const u = f.t / f.vida, env = Math.sin(Math.PI * Math.min(1, u));
    const hx = f.x - cam.x * PAR_LEJOS + f.vx * f.t, hy = f.y + f.vy * f.t;
    for (let s = 0; s < 10; s++) {
      const q = s / 10, tc = V.FUGAZ.cola * q;
      ctx.globalAlpha = env * (1 - q) * 0.9;
      pxFino(hx - f.vx * tc, hy - f.vy * tc, s ? 0.5 : 1, s ? 0.5 : 1, s < 2 ? '#ffffff' : '#c8d6ff');
    }
  }
  // EL SATELITE: un punto parejo que cruza, y a veces un destello
  if (sat.on) {
    const fl = sat.flash > 0 ? Math.exp(-((sat.t - sat.flash) ** 2) / 0.6) : 0;
    ctx.globalAlpha = Math.min(1, 0.5 + fl * 0.5);
    pxFino(sat.x - cam.x * PAR_LEJOS, sat.y, fl > 0.4 ? 1 : 0.5, fl > 0.4 ? 1 : 0.5, '#e8ecf4');
  }
  // EL AVION LEJANO, de noche: las luces de navegacion (roja y verde, parpadeo blanco)
  if (avion.on && cfg.sky !== 'storm') {
    const x = avion.x - cam.x * PAR_LEJOS, y = avion.y;
    ctx.globalAlpha = 0.8;
    pxFino(x - 1.5, y, 0.5, 0.5, '#ff4a3a'); pxFino(x + 1, y, 0.5, 0.5, '#4aff7a');
    if (((t + avion.ph) % 1.3) < 0.08) { ctx.globalAlpha = 1; pxFino(x - 0.5, y - 0.5, 1, 1, '#ffffff'); }
  }
  // LA LUZ EXTRAÑA: un punto con halo que late — ni avion (no parpadea a ritmo) ni estrella (se mueve a saltos)
  if (raro.on) {
    const x = raro.x - cam.x * PAR_LEJOS, y = raro.y;
    const entra = Math.min(1, raro.t / 0.6), late = 0.7 + 0.3 * Math.sin(t * 7.3);
    const sale = raro.fase === 2 ? Math.max(0, 1 - (raro.t - raro.tSalto) / 0.8) : 1;
    const col = raro.col ? '#a8ffcf' : '#ffc27a';
    ctx.globalAlpha = 0.25 * entra * sale * late;
    px(x - 1.5, y - 1.5, 3, 3, col);
    ctx.globalAlpha = entra * sale;
    pxFino(x - 0.5, y - 0.5, 1, 1, '#ffffff');
  }
  ctx.globalAlpha = 1;
}
