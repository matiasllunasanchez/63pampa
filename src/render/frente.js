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
import { nubeSuelta } from './nubes_cielo.js';

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
const ESC_MAX = 1.4;       // lo mas que se agranda una nube (mas, y el relieve pixelado se lee como roca)
const HALO = 8;            // px horneados de desenfoque alrededor de cada nube (el halo)
const REF = 30;            // alto (px horneados) de la pared de referencia: las nubes se escalan a lo que mide de verdad
const NUBES = [];          // { cv, luz, w, h, T, fila, u, dy }
// LAS NUBES DE LA PARED SON LAS DEL CIELO (23/11, el autor: "las nubes se ven re bien, por que no usamos ESAS nubes para
// la tormenta en vez de las que creaste?"): la receta de render/nubes_cielo.js (`nubeSuelta`), en cinco tonos de
// tormenta, y su version prendida (el relampago) en los tonos de luz. Cada una con su HALO desenfocado debajo.
const T5 = t => [t[0], t[1], t[2], t[3], t[5]];
function nubeTormenta(w, h, sem, tonos) {
  const cv = nubeSuelta(w, h, sem, T5(tonos)), luz = nubeSuelta(w, h, sem, T5(TONOS_LUZ));
  const halo = document.createElement('canvas'); halo.width = cv.width + HALO * 2; halo.height = cv.height + HALO * 2;
  { const g = halo.getContext('2d'); g.filter = 'blur(' + (HALO * 0.55) + 'px)'; g.globalAlpha = 0.9; g.drawImage(cv, HALO, HALO); }
  // LA SUAVE: la misma nube apenas desenfocada, para cuando se dibuja GRANDE (la pared encima, el techo de adentro): a
  // mas de ~1,3x el relieve pixelado de la receta se leia como roca; suavizada se lee como nube y el borde se difumina
  const suave = document.createElement('canvas'); suave.width = cv.width + 4; suave.height = cv.height + 4;
  { const g = suave.getContext('2d'); g.filter = 'blur(1.3px)'; g.drawImage(cv, 2, 2); }
  // el PERFIL de arriba (alto de la nube por columna, desde la base): lo usa `solTapado` para saber si tapa el sol
  const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, T = new Float32Array(cv.width);
  for (let x = 0; x < cv.width; x++) { let y = 0; while (y < cv.height && d[(y * cv.width + x) * 4 + 3] === 0) y++; T[x] = cv.height - y; }
  return { cv, luz, halo, suave, w: cv.width, h: cv.height, T };
}
function hornearMuro() {
  let sem = 4417;
  // DEL TAMAÑO DE LAS DEL CIELO (23/11: grandes —190 x 100— la receta se leia como roca): ATRAS, las mas anchas y
  // oscuras; ADELANTE, mas chicas. Muchas: la pared y el techo se arman repitiendolas en filas
  for (let i = 0; i < 9; i++) NUBES.push({ ...nubeTormenta(110 + (i * 37) % 60, 24 + (i * 7) % 12, sem += 97, TONOS_ATRAS), fila: 0, u: i / 9 + 0.03, dy: 0 });
  for (let i = 0; i < 12; i++) NUBES.push({ ...nubeTormenta(70 + (i * 29) % 50, 16 + (i * 5) % 10, sem += 97, TONOS), fila: 1, u: i / 12, dy: 0 });
}

// LOS RELAMPAGOS ADENTRO: con la pared a la vista, cada tanto (mas seguido cuanto mas cerca) una nube se prende
const destellos = [];
let relT = -1, ultimo = null;   // `ultimo`: donde quedo dibujada (para saber si tapa el sol)
function relampagos(a, ahora) {
  const dt = relT < 0 ? 0 : Math.min(0.1, ahora - relT); relT = ahora;
  if (a > 0.12 && Math.random() < dt * (0.3 + 1.5 * a)) destellos.push({ n: (Math.random() * NUBES.length) | 0, t0: ahora });
  for (let i = destellos.length - 1; i >= 0; i--) if (ahora - destellos[i].t0 > 0.55) destellos.splice(i, 1);
}

/** Una nube de la tormenta: chica, la de siempre (pixel nitido); grande, la SUAVE con suavizado. */
function dibujarNube(n, x, y, w, h, esc) {
  if (esc < 1.3) { ctx.imageSmoothingEnabled = false; ctx.drawImage(n.cv, x, y, w, h); return; }
  const p = 2 * w / n.w;
  ctx.imageSmoothingEnabled = true; ctx.drawImage(n.suave, x - p, y - p, w + p * 2, h + p * 2);
}
// ADENTRO DE LA TORMENTA (23/11, el autor: "dentro de la tormenta… se ve el cielo, eso no debe pasar"): un TECHO gris
// que tapa el cielo entero hasta el horizonte, con filas de las mismas nubes de tormenta corriendo despacio encima
let techoA = 0, techoT = -1;
function drawTechoTormenta(adentro) {
  const ahora = performance.now() / 1000, dt = techoT < 0 ? 0 : Math.min(0.1, ahora - techoT); techoT = ahora;
  techoA += ((adentro ? 1 : 0) - techoA) * Math.min(1, dt * 1.5);
  if (techoA < 0.01) return;
  if (!NUBES.length) hornearMuro();
  ctx.save();
  ctx.globalAlpha = techoA;
  const g = ctx.createLinearGradient(0, -40, 0, HOR + 2);
  g.addColorStop(0, '#1a2025'); g.addColorStop(0.55, '#262e35'); g.addColorStop(1, '#3a434a');
  ctx.fillStyle = g; ctx.fillRect(X0, -40, X1 - X0, HOR + 42);
  const prevSm = ctx.imageSmoothingEnabled;
  // tres filas: arriba grandes y oscuras, abajo mas chicas hacia el horizonte (corren con la camara y el viento)
  // (como la pared: el techo es gris liso; nubes solo en la franja del horizonte, chicas, que dan la distancia)
  for (let fila = 0; fila < 4; fila++) {
    const esc = [1.4, 1.2, 1, 0.75][fila], yB = [HOR * 0.3, HOR * 0.55, HOR * 0.78, HOR + 2][fila], periodo = (X1 - X0) * 1.15;
    const off = ((cam.x * (0.2 + fila * 0.15) + run.t * (4 + fila * 2)) % periodo + periodo) % periodo;
    for (let ni = 0; ni < NUBES.length; ni++) {
      const n = NUBES[ni], w = n.w * esc, h = n.h * esc, hp = HALO * esc;
      const x = X0 + (((ni / NUBES.length + fila * 0.37) % 1) * periodo - off + periodo) % periodo - w / 2;
      for (const rep of [0, -periodo]) {
        const xx = x + rep;
        if (xx + w < X0 || xx > X1) continue;
        ctx.imageSmoothingEnabled = true; ctx.drawImage(n.halo, xx - hp, yB - h - hp, w + hp * 2, h + hp * 2);
        dibujarNube(n, xx, yB - h, w, h, esc);
      }
    }
  }
  ctx.imageSmoothingEnabled = prevSm;
  ctx.restore();
}

export function drawFrenteMuro() {
  const fr = run.frente;
  drawTechoTormenta(!!(fr && fr.adentro));
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
  // LA ESCALA TOPEADA (23/11): agrandar una nube mas de ESC_MAX la volvia roca (su relieve pixelado a lo grande). De
  // lejos la pared es una fila de nubes a su escala; de cerca, cuando mide mas, se APILAN filas (cada una a ESC_MAX
  // como mucho) desde la base hasta el techo, sobre el gris de fondo
  const escPared = alto / REF, esc = Math.min(ESC_MAX, escPared), filas = Math.max(1, Math.ceil(escPared / ESC_MAX * 0.8));
  const periodo = (X1 - X0) * Math.max(1, esc * 0.9);
  const off = ((cam.x * k * 0.6) % periodo + periodo) % periodo;
  const prevSm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
  const ahora = performance.now() / 1000;
  relampagos(a, ahora);
  const posiciones = [];
  // EL GRIS DE FONDO (23/11, el autor: "rellenar el fondo con el gris que ya tenia"): una masa continua detras de las
  // nubes, desde un poco arriba del techo hasta la base, que arriba se funde con el cielo — asi no se ve cielo limpio
  // entre nube y nube
  { const yF = yBase - alto * 1.25, g = ctx.createLinearGradient(0, yF, 0, yBase);
    g.addColorStop(0, 'rgba(38,46,53,0)'); g.addColorStop(0.3, 'rgba(38,46,53,0.75)'); g.addColorStop(0.6, '#262e35'); g.addColorStop(1, '#1c2227');
    ctx.fillStyle = g; ctx.fillRect(X0, yF, X1 - X0, yBase - yF); }
  // LA BASE, maciza: una franja oscura que une los pies de las nubes (la pared no tiene huecos abajo)
  ctx.fillStyle = '#171c20'; ctx.fillRect(X0, yBase - alto * 0.28, X1 - X0, alto * 0.28 + 1);
  // SOLO LOS BORDES LLEVAN NUBES (23/11: apiladas en todo el alto se volvian una textura de roca): la fila de la BASE y,
  // si la pared ya es mas alta que una fila, la del FILO de arriba (la silueta contra el cielo); el medio es el gris liso
  const filasDib = filas > 1 ? [filas - 1, 0] : [0];
  for (const fi of filasDib) {
    const yFila = fi ? yTop + REF * esc * 0.75 : yBase, corre = fi ? 0.37 : 0;
    for (let ni = 0; ni < NUBES.length; ni++) {
      const n = NUBES[ni];
      const w = n.w * esc, h = n.h * esc, subir = n.fila === 0 ? REF * esc * 0.18 : 0;
      for (let rep = -1; rep <= 1; rep++) {
        const x = X0 + (((n.u + corre) % 1 * periodo - off) % periodo + periodo) % periodo - w / 2 + rep * periodo;
        if (x + w < X0 || x > X1) continue;
        const y = yFila - h - subir, hp = HALO * esc;
        // el halo desenfocado debajo (con suavizado: es lo que difumina), la nube encima
        ctx.imageSmoothingEnabled = true; ctx.drawImage(n.halo, x - hp, y - hp, w + hp * 2, h + hp * 2);
        dibujarNube(n, x, y, w, h, esc);
        posiciones.push({ n, x, y, w, h });
        const des = destellos.find(r => r.n === ni);
        if (des) {
          const t = ahora - des.t0, golpe = t < 0.08 ? 1 : t < 0.16 ? 0.25 : t < 0.24 ? 0.85 : Math.max(0, 1 - (t - 0.24) / 0.3);
          ctx.globalAlpha = a * golpe * 0.9; ctx.drawImage(n.luz, x, y, w, h); ctx.globalAlpha = a;
        }
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
