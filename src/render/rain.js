// LLUVIA — el campo de gotas del PASILLO.
//
// Es AMBIENTE, no mecanica: no toca la deteccion del radar, ni la velocidad, ni la distancia a la
// que aparecen los obstaculos. Es una decision, no una etapa: el juego YA tiene un clima que
// castiga —el VIENTO, que arriba de 16 m te come hasta 35% de velocidad— y el backlog le reserva
// a la NIEBLA el papel de cegarte (ROADMAP #29.1). Una lluvia que ademas penalice mete una tercera
// perilla apretando el mismo corredor, y ademas —al ser una fila de OPCIONES— convertiria una
// preferencia en un handicap: el record es un numero pelado en localStorage que no guarda con que
// configuracion se hizo, asi que prenderla o apagarla seria puntaje gratis.
// La version de dos filos (te tapa a vos Y te tapa el mundo) sigue en el ROADMAP #29 como
// parametro POR MISION, que es donde puede balancearse.
//
// EL CAMPO NO VIVE EN `parts`. Ese array es de RAFAGAS: partículas con `life` que se podan cada
// cuadro. Una lluvia permanente sembrando ahí crearia y destruiria cientos de objetos por segundo.
// Aca las gotas se RECICLAN: el pool solo cambia de tamaño cuando cambia la intensidad.
//
// Tampoco vive en los stores compartidos, por la regla de core/state.js: lo escribe un solo modulo
// y no lo lee nadie mas, asi que se queda con su modulo.

import { ctx, px, W, H } from './ctx.js';
import { cfg, S } from '../core/state.js';
import { run } from '../core/run.js';
import { hzWorld } from '../core/horizon.js';

export const RAIN_N = 4;                       // NO · GARUA · LLUVIA · TORMENTA
const VISIBLE = [0, 55, 145, 280];             // gotas en pantalla, por intensidad

// El campo cubre la pantalla con un margen chico y NADA MAS, aunque el mundo pueda girar 360°.
// Se puede porque la lluvia se dibuja FUERA de la rotacion y lo que rota es la DIRECCION de caida
// (ver fallAngle). Meterla adentro del giro obligaria a cubrir el disco entero —620x560 en vez de
// 480x270— para que no se viera el borde del campo en las esquinas, que es exactamente el problema
// que tuvo el raster del suelo. A ojo es indistinguible: la lluvia es un campo de rayas iguales,
// y lo unico que el ojo lee es su direccion y su velocidad.
const X0 = -24, X1 = W + 24, Y0 = -40, Y1 = H + 40;
const SPAN_X = X1 - X0, SPAN_Y = Y1 - Y0;

// PARALAJE por profundidad: tres capas. La de adelante cae rapido, larga y visible; la del fondo
// es lenta, corta y apenas se insinua. Sin esto la lluvia se lee como una textura pegada al vidrio.
const LAYERS = [0.42, 0.7, 1];
const V_BASE = 210;      // velocidad de caida de la capa de adelante (px de mundo por segundo)
const LEN = 13;          // largo de la raya de la capa de adelante

// INCLINACION propia de la lluvia. Vertical perfecta se ve muerta; el viento la acuesta mas.
// El signo va con las rafagas (`gusts`), que cruzan de derecha a izquierda.
const LEAN0 = 0.16, LEAN_WIND = 0.55;

const RAIN_C = '#c9d8e4';
const drops = [];

/** Direccion de caida, en radianes desde el "abajo" de la pantalla.
 *  Lleva el giro del mundo SUMADO: asi la lluvia se acuesta cuando el avion banquea —que es lo que
 *  vende el banqueo— sin tener que dibujarla adentro de la rotacion. */
function fallAngle() {
  const lean = cfg.wind ? LEAN0 + (1 - run.windF) * LEAN_WIND : LEAN0 * 0.6;
  return hzWorld() + lean;
}

/** ¿Se dibuja lluvia ahora? Solo el PASILLO: el momentum y el ARENA tienen su propia camara y su
 *  propio render, y entrar ahi es trabajo aparte (ROADMAP #29). */
const onNow = () => cfg.rain > 0 && (S.state === 'play' || S.state === 'takeoff' || S.state === 'relevo');

function seed(p) { p.x = X0 + Math.random() * SPAN_X; p.y = Y0 + Math.random() * SPAN_Y; }

/** Un cuadro del campo. Va en update() y ARRIBA de los early-return de la maquina de estados: si
 *  fuera abajo, la lluvia se congelaria durante el relevo del escuadron. */
export function stepRain(dt) {
  const n = onNow() ? VISIBLE[cfg.rain] || 0 : 0;
  while (drops.length > n) drops.pop();
  while (drops.length < n) {
    const p = { x: 0, y: 0, d: LAYERS[drops.length % LAYERS.length] };
    seed(p); drops.push(p);
  }
  if (!n) return;
  const a = fallAngle(), dx = -Math.sin(a), dy = Math.cos(a);
  for (const p of drops) {
    const v = V_BASE * p.d * dt;
    p.x += dx * v; p.y += dy * v;
    // RECICLADO POR ENVOLTURA. Al salir por arriba o por abajo se re-sortea la x: si la gota
    // volviera a la misma columna, el campo se leeria como lluvia cayendo por rieles.
    if (p.y > Y1) { p.y -= SPAN_Y; p.x = X0 + Math.random() * SPAN_X; }
    else if (p.y < Y0) { p.y += SPAN_Y; p.x = X0 + Math.random() * SPAN_X; }
    if (p.x > X1) p.x -= SPAN_X;
    else if (p.x < X0) p.x += SPAN_X;
  }
}

// ---------- LA LLUVIA CONTRA EL AVION ----------
//
// Sin esto la lluvia pasa POR DETRAS del avion y el avion queda seco en el medio de una tormenta:
// se lee como dos capas que no se conocen. Lo que lo une es que el agua PEGUE — un salpicado corto
// sobre la silueta que sale disparado hacia afuera y hacia atras.
//
// Va en coordenadas de PANTALLA y con el avion como centro, no dentro de la transformada del
// sprite: asi no hay que saber nada del alabeo, del cabeceo ni de la hoja horneada, y el efecto
// sigue al avion cuando el sprite rota (que es cuando mas se nota).
// El tope tiene que quedar POR ENCIMA del regimen de TORMENTA (34 impactos/s x el factor de
// velocidad x 0.28 s de vida ≈ 27 vivos): si recorta, LLUVIA y TORMENTA se ven igual.
const SPRAY_MAX = 40;
const spray = [];
let sprayAcc = 0;
// Cuantos impactos por segundo, por intensidad. La velocidad los multiplica: parado bajo la lluvia
// casi no salpica, y a 300 km/h el avion se come el agua de frente.
const HITS = [0, 7, 17, 34];
const SPRAY_LIFE = 0.28;

// DONDE esta el avion en pantalla. Lo fija el render (es el unico que sabe cuanto mide el sprite
// este cuadro, con su alabeo, su cabeceo y el empujon de camara) y lo consume el paso de tiempo,
// que corre en update() como todo lo demas. El desfasaje es de UN cuadro y no se ve.
const anchor = { on: false, cx: 0, cy: 0, hw: 0, hh: 0 };
/** La llama render/plane.js justo despues de dibujar el sprite. */
export function anchorSpray(cx, cy, hw, hh) { anchor.on = true; anchor.cx = cx; anchor.cy = cy; anchor.hw = hw; anchor.hh = hh; }

/** Un cuadro del salpicado. */
export function stepSpray(dt) {
  const { cx, cy, hw, hh } = anchor;
  for (let i = spray.length - 1; i >= 0; i--) {
    const p = spray[i];
    p.t += dt;
    if (p.t >= SPRAY_LIFE) { spray.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vy += 26 * dt;                    // el agua suelta cae un poco al salir del aire del avion
  }
  if (!onNow() || !anchor.on) { sprayAcc = 0; return; }
  // La cadencia sigue a la intensidad Y a la velocidad. `1 + spd/150` y no `spd/150` a secas: en
  // el despegue tambien tiene que salpicar, solo que poco.
  sprayAcc += HITS[cfg.rain] * (1 + run.spd / 150) * dt;
  const a = fallAngle(), dx = -Math.sin(a), dy = Math.cos(a);
  while (sprayAcc >= 1) {
    sprayAcc -= 1;
    if (spray.length >= SPRAY_MAX) { sprayAcc = 0; break; }
    // punto de impacto sobre la silueta: elipse ancha y chata (el avion visto de atras es un ala)
    const th = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
    const px0 = Math.cos(th) * hw * r, py0 = Math.sin(th) * hh * r;
    // sale hacia AFUERA del punto de impacto, y ademas ARRASTRADO por la caida de la lluvia:
    // si la lluvia viene inclinada, el salpicado sale para el mismo lado.
    const n = Math.hypot(px0, py0) || 1;
    const sp = 26 + Math.random() * 42;
    spray.push({
      x: cx + px0, y: cy + py0, t: 0,
      vx: (px0 / n) * sp + dx * 34, vy: (py0 / n) * sp * 0.55 + dy * 22,
      big: Math.random() < 0.28,
    });
  }
}

/** El salpicado. Se dibuja DESPUES del sprite: el agua rebota sobre el avion, no debajo.
 *
 *  RAYAS, NO PUNTOS. Con puntos sueltos el efecto se leia como chispas o como ruido de pantalla —
 *  lo que dice "agua" es el RASTRO: una raya corta en la direccion en la que sale despedida. Y como
 *  la raya sale de la velocidad de cada gota, el salpicado se abre en abanico solo. */
export function drawSpray() {
  if (!spray.length) return;
  ctx.save();
  ctx.lineCap = 'butt';
  ctx.lineWidth = 1;
  // dos pasadas: primero los rastros (mas apagados), despues la cabeza de la gota (mas viva).
  // Al reves, la cabeza quedaria tapada por el rastro de la gota siguiente.
  ctx.strokeStyle = RAIN_C;
  ctx.beginPath();
  for (const p of spray) {
    const k = 1 - p.t / SPRAY_LIFE;
    const L = (p.big ? 5 : 3.4) * k;                      // el rastro se acorta al apagarse
    const n = Math.hypot(p.vx, p.vy) || 1;
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.vx / n * L, p.y - p.vy / n * L);
  }
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  ctx.restore();
  for (const p of spray) {
    const k = 1 - p.t / SPRAY_LIFE;
    ctx.globalAlpha = 0.9 * k;                            // se apaga rapido: es una chispa de agua
    const s = p.big ? 2 : 1;
    px(p.x, p.y, s, s, k > 0.5 ? '#eef6fb' : RAIN_C);
  }
  ctx.globalAlpha = 1;
}

/** Dibuja el campo. Va DESPUES del mundo y del `restore` del horizonte giratorio, y ANTES del
 *  avion: la lluvia esta entre vos y el mundo, pero no delante de tu propio avion. */
export function drawRain() {
  if (!drops.length || !onNow()) return;
  const a = fallAngle(), dx = -Math.sin(a), dy = Math.cos(a);
  // A mas velocidad, la raya se ESTIRA. Es gratis y ata la lluvia a lo que estas haciendo: en
  // turbo la lluvia se alarga sola.
  const stretch = 1 + Math.min(1.15, run.spd / 250);
  ctx.save();
  ctx.strokeStyle = RAIN_C;
  ctx.lineCap = 'butt';
  // UN TRAZO POR CAPA, no uno por gota: alpha y grosor son de la capa, asi que las 280 rayas de
  // TORMENTA salen en tres `stroke()` en vez de 280.
  for (const d of LAYERS) {
    ctx.globalAlpha = 0.10 + 0.28 * d;
    ctx.lineWidth = d > 0.8 ? 1.1 : 0.7;
    ctx.beginPath();
    for (const p of drops) {
      if (p.d !== d) continue;
      const L = LEN * d * stretch;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - dx * L, p.y - dy * L);
    }
    ctx.stroke();
  }
  ctx.restore();
}
