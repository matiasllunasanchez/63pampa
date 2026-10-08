// LA MIRA DE BOMBARDEO — el dibujo (la cuenta es core/balistica.js).
//
// Mientras mantenes la tecla de la bomba (o la de los tanques), la curva de la caida desde la panza
// hasta donde cae, y en el final un circulo. Va en el pase del mundo (con el giro del horizonte),
// despues del avion. No decide nada.
//
// UNA LINEA FIJA, BLANCA, y no puntos (27/9: "no me gustan que sean puntos que parezcan balas que
// bajan"): un punteado que corre se leia como una rafaga cayendo. La curva quieta es la de las
// granadas de los juegos — un camino, no un proyectil.
import { ctx } from './ctx.js';
import { proj } from '../core/fx.js';
import { zVista } from '../core/blanco.js';
import { luz } from './brillo.js';

// LA LUZ DE LA MIRA (8/10, el autor: "un efecto de iluminacion desde el avion hacia el objetivo, casi
// como una luz que arranca del avion, pasa por el trayecto de la bomba y cae en el centro del circulo
// haciendo onda expansiva hacia los costados como en el agua"). Tres capas, encima de la curva:
//   EL HAZ     un brillo ancho y tenue a lo largo de toda la curva (luz sumada: no tapa, alumbra)
//   EL PULSO   un destello que recorre la curva del avion al centro del aro en VIAJE_T segundos
//   LAS ONDAS  al llegar, ONDAS aros que se abren desde el centro y se apagan (ONDA_T cada uno)
// El reloj es de pared: la mira es un instrumento, no el mundo.
let enVerde = false;
const VIAJE_T = 0.75, ONDA_T = 1.1, ONDAS = 3, CALIDO = '#fff2c8';

const BLANCO = '#eef3f6', SOMBRA = '#0d1216';
// el radio del aro EN EL MUNDO: lo que abarca la explosion (collision.js mata soldados a ~10-11)
const ARO_R = 11;

/** `tr` = lo que devuelve trayectoria(). `listo` = saldria si soltas ahora; si no (la bomba del
 *  buque bloqueada, sin bombas), la misma curva a media luz. */
// EL COLOR DICE SI PEGA (8/10, el autor: "cuando el objetivo esta en VERDE, el trayecto tambien; y el
// resplandor, en rojo"): con el blanco en verde —soltar ahora pega— la curva, el aro y el pulso van en
// el verde de la señal; si no, la curva blanca de siempre y el pulso en ROJO: todavia no.
const VERDE = { linea: '#7fe07a', luz: [127, 224, 122], css: '127,224,122' };
const ROJO = { luz: [255, 90, 60], css: '255,110,80' };
export function drawTrayectoria(tr, listo, verde) {
  enVerde = !!verde;
  if (!tr || !tr.pts.length) return;
  const a = listo === false ? 0.45 : 0.9;
  // LA LINEA FIJA AL 50% (8/10, el autor: "menos solida, que el haz tome mas protagonismo"): la curva y
  // el aro van a media opacidad; el haz, el pulso y las ondas (luzDeMira) siguen con la `a` entera
  const aL = a * 0.5;
  const pts = tr.pts.map(p => proj(p.x, p.y, p.z));
  const fin = tr.fin ? proj(tr.fin.x, tr.fin.y, tr.buque ? zVista(tr.fin.z) : tr.fin.z) : null;
  if (fin) pts.push(fin);
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // la sombra oscura debajo: sobre el mar claro del atardecer una linea blanca sola se perdia
  for (const [col, w, al] of [[SOMBRA, 3, aL * 0.6], [enVerde ? VERDE.linea : BLANCO, enVerde ? 1.6 : 1.2, enVerde ? Math.min(1, aL * 1.8) : aL]]) {
    ctx.globalAlpha = al; ctx.strokeStyle = col; ctx.lineWidth = w;
    // LINEA CORTADA (8/10, el autor): trazos quietos —no corren, para no leerse como una rafaga que baja—
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    pts.forEach((s, i) => (i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y)));
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // EL CIRCULO donde cae, ACOSTADO SOBRE LA SUPERFICIE (27/9: "deberia verse el circulo plano en la
  // tierra donde va a caer"). Es un circulo del MUNDO proyectado, no uno de pantalla: de cerca se ve
  // redondo y grande, y cuanto mas lejos cae mas chico y mas chato — que es lo que deja leer la
  // distancia. Sobre el casco va a la profundidad a la que se DIBUJA el buque (zVista).
  if (tr.fin) {
    const f = tr.fin, zf = tr.buque ? zVista(f.z) : f.z;
    const aro = [];
    for (let k = 0; k <= 24; k++) {
      const t = k / 24 * Math.PI * 2;
      aro.push(proj(f.x + Math.cos(t) * ARO_R, f.y, zf + Math.sin(t) * ARO_R));
    }
    // UN MINIMO DE ALTO: pegado al agua, la perspectiva verdadera lo aplasta hasta una raya (medido a
    // 8 m: dos pixeles de alto). Se lo estira en vertical hasta un tercio del ancho — sigue acostado
    // y sigue achicandose con la distancia, pero se lee como aro.
    const xs = aro.map(s => s.x), ys = aro.map(s => s.y);
    const ancho = Math.max(...xs) - Math.min(...xs), alto = Math.max(...ys) - Math.min(...ys);
    const cyA = (Math.max(...ys) + Math.min(...ys)) / 2, k = alto > 0 && alto < ancho / 3 ? ancho / 3 / alto : 1;
    for (const [col, w, al] of [[SOMBRA, 3, aL * 0.6], [enVerde ? VERDE.linea : BLANCO, enVerde ? 1.6 : 1.2, enVerde ? Math.min(1, aL * 1.8) : aL]]) {
      ctx.globalAlpha = al; ctx.strokeStyle = col; ctx.lineWidth = w;
      ctx.beginPath(); aro.forEach((s, i) => { const y = cyA + (s.y - cyA) * k; i ? ctx.lineTo(s.x, y) : ctx.moveTo(s.x, y); }); ctx.stroke();
    }
    ctx.globalAlpha = a; ctx.fillStyle = BLANCO;
    ctx.fillRect(Math.round(fin.x) - 1, Math.round(fin.y) - 1, 2, 2);
  }
  luzDeMira(pts, tr, a, listo !== false);
  ctx.restore();
}

/** EL HAZ, EL PULSO Y LAS ONDAS (ver arriba). `pts` es la curva ya proyectada (con el final). */
function luzDeMira(pts, tr, a, listo) {
  if (pts.length < 2) return;
  const t = performance.now() / 1000;
  // el largo de la curva en pantalla, para que el pulso vaya parejo y no se acelere donde la curva se junta
  const largos = [0];
  for (let i = 1; i < pts.length; i++) largos.push(largos[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const L = largos[largos.length - 1] || 1;
  const en = d => {
    let i = 1; while (i < largos.length - 1 && largos[i] < d) i++;
    const u = (d - largos[i - 1]) / Math.max(1e-6, largos[i] - largos[i - 1]);
    return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * u, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * u };
  };
  const fuerza = listo ? 1 : 0.4;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // (SIN HAZ FIJO a lo largo de la curva — 8/10, el autor: "parece el lazo de la Mujer Maravilla, no era
  // esa la idea". Lo que brilla es lo que VIAJA: el pulso, y la caida en el aro)
  // EL PULSO: sale del avion, recorre la curva y se apaga al entrar al aro
  const ciclo = VIAJE_T + ONDA_T * 0.5, u = (t % ciclo) / VIAJE_T;
  if (u <= 1) {
    // EL PULSO, mas visible (8/10): cola larga que se apaga, cabeza blanca con su halo, y luz de verdad
    const p = en(u * L), cola = en(Math.max(0, u * L - L * 0.22));
    const g = ctx.createLinearGradient(cola.x, cola.y, p.x, p.y);
    const C = enVerde ? VERDE.css : ROJO.css;
    g.addColorStop(0, `rgba(${C},0)`); g.addColorStop(1, `rgba(${C},${fuerza})`);
    ctx.globalAlpha = a; ctx.strokeStyle = g; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cola.x, cola.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    ctx.globalAlpha = 0.45 * fuerza * a; ctx.fillStyle = `rgb(${C})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = fuerza * a; ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(p.x) - 1.5, Math.round(p.y) - 1.5, 3, 3);
    luz(ctx, p.x, p.y, 10, enVerde ? VERDE.luz : ROJO.luz, 0.8 * fuerza);
  }
  // LAS ONDAS: desde el centro del aro hacia afuera, acostadas como el aro (mismo achatado minimo)
  if (tr.fin) {
    const f = tr.fin, zf = tr.buque ? zVista(f.z) : f.z, c = pts[pts.length - 1];
    const borde = proj(f.x + ARO_R, f.y, zf);
    const rx = Math.max(3, Math.abs(borde.x - c.x));
    const ry = Math.max(rx / 3, Math.abs(proj(f.x, f.y, zf + ARO_R).y - c.y));
    const t0 = t - VIAJE_T;   // las ondas arrancan cuando el pulso llega
    for (let i = 0; i < ONDAS; i++) {
      const v = ((t0 % ciclo) + ciclo) % ciclo / ONDA_T - i * 0.22;   // escalonadas
      if (v <= 0 || v >= 1) continue;
      const e = 1 - (1 - v) * (1 - v);                                  // salen rapido y frenan
      // (8/10: las ondas, mas visibles — mas gruesas, mas opacas y que se abren mas: la piedra en el agua)
      ctx.globalAlpha = (1 - v) * fuerza * a; ctx.strokeStyle = `rgb(${enVerde ? VERDE.css : ROJO.css})`; ctx.lineWidth = 2 * (1 - v) + 0.8;
      ctx.beginPath(); ctx.ellipse(c.x, c.y, rx * (0.1 + 1.7 * e), ry * (0.1 + 1.7 * e), 0, 0, Math.PI * 2); ctx.stroke();
    }
    // el centro iluminado mientras llega la luz
    // el centro se enciende un instante cuando cae el pulso, y despues queda tenue
    const golpe = Math.max(0, 1 - (((t0 % ciclo) + ciclo) % ciclo) / 0.25);
    luz(ctx, c.x, c.y, rx * 1.2, enVerde ? VERDE.luz : ROJO.luz, (0.3 + 0.7 * golpe) * fuerza);
    if (golpe > 0) { ctx.globalAlpha = golpe * fuerza * a; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(c.x, c.y, 2 + rx * 0.25 * golpe, (2 + rx * 0.25 * golpe) * ry / rx, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}
