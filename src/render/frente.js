// EL FRENTE DE TORMENTA, DIBUJADO (18/11/2026; el estado en systems/frente.js, que deja `run.frente`).
//
// LA PARED (drawFrenteMuro): la nube de arco de las fotos del autor — una masa gris oscura con escalones claros
// en el borde de abajo (el "labio" de la nube) y, debajo, la cortina de lluvia hasta el horizonte. Se proyecta con
// la camara de siempre: base y techo en metros (FRENTE.BASE / TOPE) a la distancia que falta, asi que de lejos es
// una franja baja en el horizonte y al acercarse trepa hasta taparte el cielo. Va con el fondo: despues del cielo
// y antes de las sierras (las sierras quedan delante).
//
// LA NIEBLA DEL CRUCE y LO OSCURO (drawFrenteNiebla): encima del mundo y debajo del HUD.
import { ctx, W, H, HOR, F } from './ctx.js';
import { cam } from '../core/state.js';
import { run } from '../core/run.js';
import { FRENTE } from '../data/tuning.js';
import { ruido } from '../core/tierra.js';

const suave = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
const X0 = -80, X1 = W + 80, PASO = 4;

// LA PARED, HECHA DE NUBES (23/11, el autor: "las nubes del cielo deben parecerse a nubes: usar la misma tecnica de las
// nubes de fondo, relampagos de luz dentro de las nubes mientras se acerca la tormenta, y va tapando el cielo"; y despues:
// "las nubes que creaste a lo lejos son horribles"): la primera version era UN dibujo estirado a lo alto y se leia como
// bandas corridas. Ahora la pared es una FILA DE CUMULONIMBOS sueltos, cada uno horneado una vez con la receta de
// render/nubes_cielo.js (base chata, copetes con su luz arriba y su panza en sombra, relieve, filo deshilachado con trama
// Bayer), escalados PAREJO (nunca estirados) segun lo que mide la pared, en dos filas: la de atras mas alta y oscura.
// Cada nube tiene ademas su version ENCENDIDA: el relampago la prende entera desde adentro, dos golpes y se apaga.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bay = (x, y) => BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.5;
const hexRgb = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const TONOS = ['#14181c', '#1c2227', '#283036', '#363f46', '#4b545b', '#6c757c'].map(hexRgb);
const TONOS_ATRAS = ['#171c21', '#1e252b', '#262e35', '#2f383f', '#3b444b', '#4d565d'].map(hexRgb);
const TONOS_LUZ = ['#3b4756', '#5e6f82', '#93a7bb', '#c8d8e8', '#eaf3fc', '#ffffff'].map(hexRgb);
const REF = 90;            // alto (px horneados) de la pared de referencia: las nubes se escalan a lo que mide de verdad
const NUBES = [];          // { cv, luz, w, h, T, fila, u, dy }
function hornearNube(w, h, sem, tonos) {
  // (copos ANCHOS y redondos, varios superpuestos: con los finos y altos la pared se leia como una sierra)
  const domos = [], n = 5 + (ruido(sem, 0.5, 11) * 3 | 0);
  for (let i = 0; i < n; i++) {
    const cU = 0.12 + 0.76 * ((i + 0.5) / n + (ruido(sem + i * 3.1, 7.7, 13) - 0.5) * 0.18);
    domos.push(cU, 0.2 + 0.14 * ruido(sem, i * 2.3, 17), (0.62 + 0.3 * ruido(i * 5.7, sem, 19)) * (1 - Math.abs(cU - 0.5) * 0.6));
  }
  const T = new Float32Array(w);
  for (let x = 0; x < w; x++) {
    const u = (x + 0.5) / w;
    let top = Math.pow(Math.sin(Math.PI * u), 0.6) * 0.5;
    for (let i = 0; i < domos.length; i += 3) {
      const d = (u - domos[i]) / domos[i + 1];
      if (d > -1 && d < 1) top = Math.max(top, Math.sqrt(1 - d * d) * domos[i + 2]);
    }
    T[x] = h * top * (0.95 + 0.08 * ruido(x / 9, 1.3, sem));
  }
  const H = h + 2;
  const dentro = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= H) return false;
    const yy = H - 1 - y, u = (x + 0.5) / w;
    if (yy < Math.max(0, 2 - Math.min(u, 1 - u) * 20)) return false;              // la base chata
    return T[x] - yy + (ruido(x / 3, y / 3, sem + 5) - 0.5) * 1.4 + bay(x, y) * 0.9 > 0;
  };
  const mk = () => { const c = document.createElement('canvas'); c.width = w; c.height = H; return c; };
  const cv = mk(), luz = mk();
  const im = cv.getContext('2d').createImageData(w, H), il = luz.getContext('2d').createImageData(w, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) {
    if (!dentro(x, y)) continue;
    const i = (y * w + x) * 4, yy = H - 1 - y, v = yy / Math.max(1, T[x]);
    // la luz de arriba a la izquierda sobre cada copo (el ruido grande contra el de un poco mas alla), la panza oscura
    const n1 = ruido(x / 11, y / 8, sem + 21), n2 = ruido((x + 3) / 11, (y + 3) / 8, sem + 21);
    let lum = 0.08 + 0.72 * Math.pow(Math.min(1, v), 0.8) + (n1 - n2) * 2.2;
    if (yy < 3) lum -= 0.3;                                                        // la panza
    if (!dentro(x, y - 1)) lum += 0.22;                                            // el filo de arriba
    const kk = Math.max(0, Math.min(5, Math.floor((lum + bay(x, y) * 0.2) * 5.2)));
    const a = tonos[kk], b = TONOS_LUZ[Math.min(5, kk + 1)];
    im.data[i] = a[0]; im.data[i + 1] = a[1]; im.data[i + 2] = a[2]; im.data[i + 3] = 255;
    il.data[i] = b[0]; il.data[i + 1] = b[1]; il.data[i + 2] = b[2]; il.data[i + 3] = 255;
  }
  cv.getContext('2d').putImageData(im, 0, 0); luz.getContext('2d').putImageData(il, 0, 0);
  return { cv, luz, w, h: H, T };
}
function hornearMuro() {
  let sem = 4417;
  // ATRAS: torres altas y anchas, oscuras (el yunque del cumulonimbo); ADELANTE: mas bajas y mas seguidas
  for (let i = 0; i < 6; i++) NUBES.push({ ...hornearNube(190 + (i * 37) % 70, 80 + (i * 23) % 20, sem += 97, TONOS_ATRAS), fila: 0, u: i / 6 + 0.04, dy: 0 });
  for (let i = 0; i < 8; i++) NUBES.push({ ...hornearNube(140 + (i * 29) % 60, 48 + (i * 17) % 18, sem += 97, TONOS), fila: 1, u: i / 8, dy: 0 });
}

// LOS RELAMPAGOS ADENTRO: con la pared a la vista, cada tanto (mas seguido cuanto mas cerca) una nube se prende
const destellos = [];
let relT = -1, ultimo = null;   // `ultimo`: donde quedo dibujada (para saber si tapa el sol)
function relampagos(a, ahora) {
  const dt = relT < 0 ? 0 : Math.min(0.1, ahora - relT); relT = ahora;
  if (a > 0.12 && Math.random() < dt * (0.3 + 1.5 * a)) destellos.push({ n: (Math.random() * NUBES.length) | 0, t0: ahora });
  for (let i = destellos.length - 1; i >= 0; i--) if (ahora - destellos[i].t0 > 0.55) destellos.splice(i, 1);
}

export function drawFrenteMuro() {
  const fr = run.frente;
  if (!fr || fr.muro == null) { ultimo = null; return; }
  const d = Math.max(30, fr.muro), k = F / d;
  const a = suave((FRENTE.VISTA - d) / 800);          // asoma de a poco en el horizonte
  if (a <= 0.01) { ultimo = null; return; }
  if (!NUBES.length) hornearMuro();
  const yBase = HOR - (FRENTE.BASE - cam.y) * k, yTop = HOR - (FRENTE.TOPE - cam.y) * k, alto = Math.max(2, yBase - yTop);
  ctx.save();
  ctx.globalAlpha = a;
  // LA CORTINA DE LLUVIA, debajo de la base hasta el horizonte: el mar lejano se pierde en gris
  if (yBase < HOR + 4) {
    const g = ctx.createLinearGradient(0, yBase, 0, HOR + 4);
    g.addColorStop(0, 'rgba(30,36,42,0.9)'); g.addColorStop(1, 'rgba(58,65,72,0.7)');
    ctx.fillStyle = g; ctx.fillRect(X0, yBase - 1, X1 - X0, HOR + 5 - yBase);
    ctx.fillStyle = 'rgba(110,118,126,0.16)';
    for (let x = X0 + ((run.dist * 0.05) % 6); x < X1; x += 6) ctx.fillRect(x, yBase + 1, 1, HOR + 3 - yBase);
  }
  // LAS NUBES: escala PAREJA (la pared de referencia mide REF), apoyadas en la base, repartidas a lo ancho y repetidas
  // de costado; corren apenas con la camara
  const esc = alto / REF, periodo = (X1 - X0) * Math.max(1, esc * 0.9);
  const off = ((cam.x * k * 0.6) % periodo + periodo) % periodo;
  const prevSm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
  const ahora = performance.now() / 1000;
  relampagos(a, ahora);
  const posiciones = [];
  // LA BASE, maciza: una franja oscura que une los pies de las nubes (la pared no tiene huecos abajo)
  ctx.fillStyle = '#171c20'; ctx.fillRect(X0, yBase - alto * 0.28, X1 - X0, alto * 0.28 + 1);
  for (let ni = 0; ni < NUBES.length; ni++) {
    const n = NUBES[ni];
    const w = n.w * esc, h = n.h * esc, subir = n.fila === 0 ? alto * 0.18 : 0;
    for (let rep = -1; rep <= 1; rep++) {
      const x = X0 + ((n.u * periodo - off) % periodo + periodo) % periodo - w / 2 + rep * periodo;
      if (x + w < X0 || x > X1) continue;
      const y = yBase - h - subir;
      ctx.drawImage(n.cv, x, y, w, h);
      posiciones.push({ n, x, y, w, h });
      const des = destellos.find(r => r.n === ni);
      if (des) {
        const t = ahora - des.t0, golpe = t < 0.08 ? 1 : t < 0.16 ? 0.25 : t < 0.24 ? 0.85 : Math.max(0, 1 - (t - 0.24) / 0.3);
        ctx.globalAlpha = a * golpe * 0.9; ctx.drawImage(n.luz, x, y, w, h); ctx.globalAlpha = a;
      }
    }
  }
  ctx.imageSmoothingEnabled = prevSm;
  ctx.restore();
  ultimo = { posiciones, yBase, alto, a };
}

/** ¿La pared TAPA el sol (en pantalla en `sol` = { x, y })? 0..1 — con una nube de la pared por encima del astro, el
 *  destello y el reflejo en el agua se apagan (23/11, el autor: "una vez que la nube tapa el sol el reflejo debe dejar
 *  de estar"). */
export function solTapado(sol) {
  if (!ultimo || !sol) return 0;
  let techo = ultimo.yBase - ultimo.alto * 0.28;   // la base maciza
  for (const p of ultimo.posiciones) {
    if (sol.x < p.x || sol.x >= p.x + p.w) continue;
    const col = Math.max(0, Math.min(p.n.w - 1, Math.floor((sol.x - p.x) / p.w * p.n.w)));
    techo = Math.min(techo, p.y + p.h * (1 - p.n.T[col] / p.n.h));
  }
  return ultimo.a * suave((sol.y - techo + 2) / 8);
}

/** La niebla del cruce y la penumbra de la pared encima. */
export function drawFrenteNiebla() {
  const fr = run.frente;
  if (!fr) return;
  ctx.save();
  if (fr.oscuro > 0.01) {
    ctx.globalAlpha = fr.oscuro; ctx.fillStyle = '#0b0f14';
    ctx.fillRect(-W, -H, W * 3, H * 3);
  }
  if (fr.niebla > 0.01) {
    // mas cerrada contra el horizonte; gris claro de este lado, mas oscuro del lado de la tormenta
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(96,104,112,0.82)');
    g.addColorStop(HOR / H, 'rgba(118,126,133,1)');
    g.addColorStop(1, 'rgba(84,92,100,0.9)');
    ctx.globalAlpha = fr.niebla; ctx.fillStyle = g;
    ctx.fillRect(-W, -H, W * 3, H * 3);
  }
  ctx.restore();
}
