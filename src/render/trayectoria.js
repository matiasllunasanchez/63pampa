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

const BLANCO = '#eef3f6', SOMBRA = '#0d1216';
// el radio del aro EN EL MUNDO: lo que abarca la explosion (collision.js mata soldados a ~10-11)
const ARO_R = 11;

/** `tr` = lo que devuelve trayectoria(). `listo` = saldria si soltas ahora; si no (la bomba del
 *  buque bloqueada, sin bombas), la misma curva a media luz. */
export function drawTrayectoria(tr, listo) {
  if (!tr || !tr.pts.length) return;
  const a = listo === false ? 0.45 : 0.9;
  const pts = tr.pts.map(p => proj(p.x, p.y, p.z));
  const fin = tr.fin ? proj(tr.fin.x, tr.fin.y, tr.buque ? zVista(tr.fin.z) : tr.fin.z) : null;
  if (fin) pts.push(fin);
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // la sombra oscura debajo: sobre el mar claro del atardecer una linea blanca sola se perdia
  for (const [col, w, al] of [[SOMBRA, 3, a * 0.6], [BLANCO, 1.2, a]]) {
    ctx.globalAlpha = al; ctx.strokeStyle = col; ctx.lineWidth = w;
    ctx.beginPath();
    pts.forEach((s, i) => (i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y)));
    ctx.stroke();
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
    for (const [col, w, al] of [[SOMBRA, 3, a * 0.6], [BLANCO, 1.2, a]]) {
      ctx.globalAlpha = al; ctx.strokeStyle = col; ctx.lineWidth = w;
      ctx.beginPath(); aro.forEach((s, i) => { const y = cyA + (s.y - cyA) * k; i ? ctx.lineTo(s.x, y) : ctx.moveTo(s.x, y); }); ctx.stroke();
    }
    ctx.globalAlpha = a; ctx.fillStyle = BLANCO;
    ctx.fillRect(Math.round(fin.x) - 1, Math.round(fin.y) - 1, 2, 2);
  }
  ctx.restore();
}
