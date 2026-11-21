// LAS ISLAS REALES — EL MAPA DE DESARROLLO, DIBUJADO (los datos: systems/islas/islas.js `mapaDatos`, que pasa
// game.js; el render no lee systems). Sobre el velo de la pausa: el mapa a la izquierda —tu avion como una
// flecha naranja con su rumbo, el objetivo con su cuadro, los lugares y el cursor para saltar— y a la derecha,
// donde estas exactamente (latitud, longitud, altura, rumbo, el lugar mas cercano) y las teclas.
import { ctx, W as NW, H as NH, uiFont, titleFont } from './ctx.js';
import { P } from '../data/palette.js';
import { T } from '../core/i18n.js';

const X0 = 8, Y0 = 26, MW = 300, MH = NH - Y0 - 10;

/** Donde cae el mapa en pantalla (lo usa tambien game.js para mover el cursor en pixeles parejos). */
export function marco(img) {
  const k = Math.min(MW / img.width, MH / img.height);
  return { x: X0, y: Y0, w: Math.round(img.width * k), h: Math.round(img.height * k) };
}

function rombo(x, y, r) { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); ctx.stroke(); }

export function drawMapaIslas(d, t) {
  ctx.fillStyle = '#070a0dee'; ctx.fillRect(0, 0, NW, NH);
  ctx.fillStyle = P.accent; ctx.font = titleFont(14); ctx.textAlign = 'left';
  ctx.fillText(T('pauseMapa'), X0, 18);
  if (!d || !d.img) { ctx.fillStyle = P.dim; ctx.font = uiFont('monospace', 7); ctx.fillText('…', X0, 40); return; }
  const m = marco(d.img), aP = q => [m.x + q.u * m.w, m.y + q.v * m.h];
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(d.img, m.x, m.y, m.w, m.h);
  ctx.strokeStyle = '#3a4a52'; ctx.lineWidth = 1; ctx.strokeRect(m.x - 0.5, m.y - 0.5, m.w + 1, m.h + 1);
  // LOS LUGARES: un punto y el nombre, EN AMARILLO y con contorno negro (19/11, el autor: "los textos de Isla
  // Borbon, Bahia Fox y demas estan demasiado ilegibles"; antes iban en 4 px crema sobre el relieve)
  ctx.font = 'bold 6px monospace'; ctx.lineJoin = 'round';
  const nombre = (txt, x, y, col) => { ctx.strokeStyle = '#000000d0'; ctx.lineWidth = 2; ctx.strokeText(txt, x, y); ctx.fillStyle = col; ctx.fillText(txt, x, y); };
  // (los nombres que se pisarian con uno ya escrito quedan solo como punto: los montes del este estan juntos)
  const puestos = [];
  ctx.save(); ctx.beginPath(); ctx.rect(m.x, m.y, m.w, m.h); ctx.clip();   // (los nombres no se salen del mapa)
  // LAS DOS ISLAS (21/11): en grande y crema, debajo de los lugares, centradas sobre cada isla
  ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
  for (const l of d.islas || []) {
    const [x, y] = aP(l);
    ctx.globalAlpha = 0.85; nombre(l.n, Math.round(x), Math.round(y), '#f0e6c4'); ctx.globalAlpha = 1;
  }
  ctx.font = 'bold 6px monospace'; ctx.textAlign = 'left';
  for (const l of d.lugares) {
    const [x, y] = aP(l), w = ctx.measureText(l.n).width + 2;
    ctx.fillStyle = '#ffd84a'; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
    // (el que no entra a la derecha va a la izquierda del punto)
    const lx = x + 3 + w > m.x + m.w ? x - 3 - w : x + 3;
    const r = { x: lx - 1, y: y - 5, w, h: 7 };
    if (puestos.some(o => r.x < o.x + o.w && o.x < r.x + r.w && r.y < o.y + o.h && o.y < r.y + r.h)) continue;
    puestos.push(r);
    nombre(l.n, Math.round(lx), Math.round(y) + 2, '#ffd84a');
  }
  ctx.restore();
  // EL TEATRO (systems/islas/teatro.js): las bases (celeste lo nuestro, rojo lo britanico), los buques (un
  // trazo) y las PAC (su circulo, punteado). Lo britanico aparece recien cuando lo pasaste cerca.
  for (const q of d.teatro || []) {
    // (un BUQUE no se sabe de quien es: sin identificador — 21/11, el autor — va en gris)
    const [x, y] = aP(q), col = q.k === 'buque' ? '#b8c0c6' : q.bando === 'arg' ? '#8fc8ec' : '#e0503c';
    ctx.fillStyle = ctx.strokeStyle = col;
    if (q.k === 'base') { ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3); }
    else if (q.k === 'buque') { if (q.vivo) ctx.fillRect(Math.round(x) - 1, Math.round(y), 3, 1); else ctx.fillRect(Math.round(x), Math.round(y), 1, 1); }
    else if (q.k === 'pacv') { if (Math.floor(t * 5) % 2 === 0) ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3); }
    else if (q.k === 'radar') {
      // LA ZONA DE RADAR: un circulo fino (el nuestro, celeste y entero; el de ellos, rojo y cortado) y un tinte
      ctx.save(); ctx.beginPath(); ctx.rect(m.x, m.y, m.w, m.h); ctx.clip();
      ctx.globalAlpha = 0.08; ctx.beginPath(); ctx.arc(x, y, q.r * m.w, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.85; ctx.lineWidth = 1; ctx.setLineDash(q.bando === 'arg' ? [] : [3, 2]); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
    }
    else if (q.k === 'pac') {
      ctx.setLineDash([1, 2]); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, Math.max(2, q.r * m.w), 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
  }
  // EL OBJETIVO: un cuadro naranja (tachado si ya cayo) que late
  if (d.obj) {
    const [x, y] = aP(d.obj), r = 3 + (d.obj.vivo ? Math.sin(t * 6) * 0.8 : 0);
    ctx.strokeStyle = d.obj.vivo ? P.accent : P.dim; ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(x - r) + 0.5, Math.round(y - r) + 0.5, Math.round(r * 2), Math.round(r * 2));
    if (!d.obj.vivo) { ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.stroke(); }
  }
  // LA MARCA DEL JUGADOR (ENTER / ✕ / click): un rombo amarillo que late, con su nombre
  if (d.marca) {
    const [x, y] = aP(d.marca), r = 4 + Math.sin(t * 6) * 0.8;
    ctx.strokeStyle = '#000'; ctx.lineWidth = 3; rombo(x, y, r); ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 1; rombo(x, y, r);
    ctx.font = 'bold 6px monospace'; nombre(d.marca.n, Math.round(x) + 7, Math.round(y) - 5, '#ffe14d');
  }
  // EL AVION: una flecha naranja con su rumbo (0 = norte, arriba)
  { const [x, y] = aP(d.avion), a = d.avion.rumbo;
    const p = (f, s) => [x + Math.sin(a) * f + Math.cos(a) * s, y - Math.cos(a) * f + Math.sin(a) * s];
    ctx.fillStyle = '#ffd479'; ctx.beginPath();
    ctx.moveTo(...p(6, 0)); ctx.lineTo(...p(-3, 3)); ctx.lineTo(...p(-1, 0)); ctx.lineTo(...p(-3, -3)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#000a'; ctx.stroke(); }
  // EL CURSOR: una cruz que titila
  // (pegado a un punto: un cuadro blanco alrededor del punto y su nombre en blanco)
  if (d.cursor) {
    const p = d.cursor.punto, [x, y] = aP(p || d.cursor);
    if (p) {
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.strokeRect(Math.round(x) - 5.5, Math.round(y) - 5.5, 11, 11);
      ctx.font = 'bold 6px monospace'; nombre(p.n, Math.round(x) + 8, Math.round(y) + 2, '#ffffff');
    } else if (Math.floor(t * 4) % 2 === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x) - 4, Math.round(y), 9, 1); ctx.fillRect(Math.round(x), Math.round(y) - 4, 1, 9); }
  }
  // LA COLUMNA DE LA DERECHA: donde estas
  const cx = X0 + MW + 10;
  let y = 40;
  const linea = (txt, col, f = 6) => { ctx.fillStyle = col; ctx.font = uiFont('monospace', f); ctx.fillText(txt, cx, y); y += f + 3; };
  linea(T('mapaAqui'), P.accent, 7);
  linea(d.lat, P.foam); linea(d.lon, P.foam);
  linea(T('mapaAlt', { a: d.alt, s: d.suelo }), P.dim);
  linea(T('mapaRumbo', { r: d.rumbo }), P.dim);
  y += 4;
  if (d.cerca) linea(T('mapaCerca', { n: d.cerca.n, d: (d.cerca.d / 1000).toFixed(1) }), P.dim, 5);
  if (d.obj && d.obj.vivo) { y += 4; linea(T('mapaObjetivo'), P.accent, 7); linea(d.obj.n + '  ' + (d.obj.d / 1000).toFixed(1) + ' km', P.accent); }
  if (d.marca) { y += 4; linea(T('mapaMarca'), '#ffe14d', 7); linea(d.marca.n + '  ' + (d.marca.d / 1000).toFixed(1) + ' km', '#ffe14d'); }
  if (d.cursor) { y += 4; linea(T('mapaCursor'), '#ffffff', 7); if (d.cursor.punto) linea(d.cursor.punto.n, '#ffffff'); linea(d.cursor.lat, P.foam); linea(d.cursor.lon, P.foam); linea(d.cursor.h + ' m', P.dim); }
  y = NH - 46;
  for (const k of ['mapaTeclas1', 'mapaTeclas2', 'mapaTeclas3', 'mapaTeclas4', 'mapaTeclas5']) linea(T(k), '#9fb0b6', 5);
}
