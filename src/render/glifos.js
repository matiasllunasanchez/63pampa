// LOS MANDOS DIBUJADOS (21/11, el autor, sobre el tutorial: "no uses la palabra STICK: mostra una perilla igual a la
// del joystick, y en teclado dibuja una tecla"). Lee el MISMO texto de la tabla de CONTROLES (data/strings.js
// `ctrl<Nombre>K` / `…P`, ya pasado por `padTexto` para Xbox) y lo convierte en dibujitos:
//
//   teclado   cada tecla es una TECLA (la tapa clara con su letra; ESPACIO, SHIFT… mas anchas; las flechas con su
//             flecha). El «·» de la tabla separa alternativas: entre grupos va una barrita.
//   joystick  «stick izq ← →» es la PERILLA del joystick (el aro y el hongo corrido hacia donde se mueve, con las
//             flechas), «R1 / L2 / LB…» el gatillo de arriba, «✕ ◯ △ ▢ / A B X Y» el boton redondo, «cruceta ▲» la
//             cruz con el brazo que se aprieta.
//   lo demas  queda escrito (p. ej. «secuencias de toques»).
//
// Todo en la grilla del HUD (320x180): `h` es el alto de la fila (8-10 px). Sin estado: se parsea y se dibuja.
import { ctx } from './ctx.js';

const PALABRAS_TECLA = new Set(['ESPACIO', 'SPACE', 'SHIFT', 'TAB', 'ENTER', 'ESC', 'SUPR', 'DEL', 'ALT', 'CTRL', 'RUEDITA', 'WHEEL', 'BACKSPACE']);
const FLECHA = { '←': 'l', '→': 'r', '↑': 'u', '↓': 'd' };
const DIR_PAL = { izquierda: 'l', derecha: 'r', arriba: 'u', abajo: 'd', up: 'u', down: 'd' };   // (left/right no: en ingles nombran el stick)
const CARA = new Set(['✕', '◯', '△', '▢', '□', 'A', 'B', 'X', 'Y']);
const HOMBRO = /^(L1|R1|L2|R2|LB|RB|LT|RT|L3|R3|LS|RS|START|SELECT|OPTIONS|SHARE|MENU|VIEW|BACK)$/;

/** El texto de un mando → la lista de glifos. `pad` = es del joystick. */
export function glifosDe(texto, pad) {
  const out = [];
  const grupos = String(texto || '').split('·').map(g => g.trim()).filter(Boolean);
  // (en el joystick «stick der ↑ + R3»: dos mandos juntos — se dibujan con un + en el medio)
  if (pad && grupos.some(g => g.includes('+'))) {
    return grupos.flatMap((g, gi) => [...(gi ? [{ k: 'sep' }] : []),
      ...g.split('+').map(x => x.trim()).filter(Boolean).flatMap((x, xi) => [...(xi ? [{ k: 'txt', t: '+' }] : []), ...glifosDe(x, true)])]);
  }
  grupos.forEach((g, gi) => {
    if (gi) out.push({ k: 'sep' });
    const pal = g.split(/\s+/);
    if (pad) {
      const low = g.toLowerCase();
      if (/sticks\b/.test(low)) { out.push({ k: 'stick', lado: 'L', dirs: [] }, { k: 'stick', lado: 'R', dirs: [] }); return; }
      if (/\bstick\b/.test(low)) {
        const lado = /\bder|\bright\b/.test(low) ? 'R' : 'L';
        const dirs = [], cuenta = {};
        for (const p of pal) {
          for (const ch of p) if (FLECHA[ch]) { cuenta[ch] = (cuenta[ch] || 0) + 1; if (!dirs.includes(FLECHA[ch])) dirs.push(FLECHA[ch]); }
          const d = DIR_PAL[p.toLowerCase()]; if (d && !dirs.includes(d)) dirs.push(d);
        }
        // (la misma flecha repetida es un TOQUE repetido: «→ →» = dos toques — se dibuja ×2)
        const veces = Math.max(1, ...Object.values(cuenta));
        out.push({ k: 'stick', lado, dirs, veces });
        return;
      }
      if (/^cruceta|^d-?pad/.test(low)) {
        // (◄ ► tambien: la tabla de CONTROLES usa esas — antes caian en ▲ y la Chancha se dibujaba como la bomba)
        const m = /[▲▼◀▶◄►]/.exec(g); out.push({ k: 'cruceta', dir: m ? { '▲': 'u', '▼': 'd', '◀': 'l', '▶': 'r', '◄': 'l', '►': 'r' }[m[0]] : 'u' });
        return;
      }
      if (/^gatillo|^trigger/.test(low)) { out.push({ k: 'hombro', t: 'R2' }); return; }
      for (const p of pal) {
        if (HOMBRO.test(p)) out.push({ k: 'hombro', t: p });
        else if (CARA.has(p)) out.push({ k: 'cara', t: p });
        else out.push({ k: 'txt', t: p });
      }
      return;
    }
    // teclado: una tecla por palabra corta o conocida; las frases quedan escritas
    const esTecla = p => p === '+' || FLECHA[p] || p.length <= 2 || PALABRAS_TECLA.has(p.toUpperCase());
    if (!pal.every(esTecla)) { out.push({ k: 'txt', t: g }); return; }
    for (const p of pal) out.push(p === '+' ? { k: 'txt', t: '+' } : { k: 'tecla', t: p });
  });
  return out;
}

const FUENTE = h => `bold ${Math.max(4, Math.round(h * 0.55))}px monospace`;
const AIRE = 1;   // (21/11, "linea visual mas corta": menos aire entre mandos)
/** Cuanto mide cada glifo de ancho, con el alto `h`. */
function ancho(g, h) {
  if (g.k === 'sep') return 3;
  if (g.k === 'stick') return h + (g.dirs.length ? 2 : 0) + (g.veces > 1 ? 8 : 0);
  if (g.k === 'cara' || g.k === 'cruceta') return h;
  ctx.font = FUENTE(h);
  if (g.k === 'tecla') return Math.max(h, Math.ceil((FLECHA[g.t] ? 0 : ctx.measureText(g.t).width) + 5));
  if (g.k === 'hombro') return Math.ceil(ctx.measureText(g.t).width + 6);
  ctx.font = `${Math.max(4, Math.round(h * 0.5))}px monospace`;
  return Math.ceil(ctx.measureText(g.t).width);
}
export function medir(lista, h) { return lista.reduce((a, g, i) => a + ancho(g, h) + (i ? AIRE : 0), 0); }

function flecha(cx, cy, d, r, col) {
  ctx.fillStyle = col;
  const [ux, uy] = { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] }[d];
  const px = cx + ux * r, py = cy + uy * r, sx = -uy, sy = ux;
  ctx.beginPath();
  ctx.moveTo(px + ux * 2, py + uy * 2); ctx.lineTo(px + sx * 1.6, py + sy * 1.6); ctx.lineTo(px - sx * 1.6, py - sy * 1.6);
  ctx.closePath(); ctx.fill();
}
function redondo(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

/** Dibuja la fila con su esquina izquierda en (x, y) y alto `h`. `t` (s) anima la perilla (va y viene). */
export function dibujar(lista, x, y, h, t = 0, col = '#e8eef0') {
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let cx = x;
  lista.forEach((g, i) => {
    if (i) cx += AIRE;
    const w = ancho(g, h), my = y + h / 2;
    if (g.k === 'sep') {
      ctx.fillStyle = '#5d6a71'; ctx.fillRect(Math.round(cx + w / 2), Math.round(y + h * 0.3), 1, Math.max(2, Math.round(h * 0.4)));
    } else if (g.k === 'tecla') {
      // LA TECLA: la tapa clara, el borde de abajo mas oscuro (la profundidad) y la letra
      ctx.fillStyle = '#5b666c'; redondo(cx, y + 1, w, h - 1, 1.6); ctx.fill();
      ctx.fillStyle = '#d9dfe2'; redondo(cx, y, w, h - 2, 1.6); ctx.fill();
      if (FLECHA[g.t]) flecha(cx + w / 2, y + (h - 2) / 2, FLECHA[g.t], 0.4, '#1c2226');
      else { ctx.font = FUENTE(h); ctx.fillStyle = '#1c2226'; ctx.fillText(g.t, cx + w / 2, y + (h - 2) / 2 + 0.5); }
    } else if (g.k === 'stick') {
      // LA PERILLA: el aro de la base y el hongo, corrido (y yendo y viniendo) hacia donde se mueve
      const r = h / 2 - 0.5, sx = cx + (w - (g.veces > 1 ? 8 : 0)) / 2;
      ctx.fillStyle = '#2b3337'; ctx.beginPath(); ctx.arc(sx, my, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#7f9099'; ctx.lineWidth = 0.8; ctx.stroke();
      for (const d of g.dirs) flecha(sx, my, d, r + 0.3, '#e8a33d');
      // a donde va el hongo: recorre las direcciones, de a una
      let ox = 0, oy = 0;
      if (g.dirs.length) {
        const d = g.dirs[Math.floor(t * 1.4) % g.dirs.length], k = Math.min(1, (t * 1.4 % 1) * 3) * r * 0.42;
        ox = d === 'l' ? -k : d === 'r' ? k : 0; oy = d === 'u' ? -k : d === 'd' ? k : 0;
      }
      ctx.fillStyle = '#c9d1d5'; ctx.beginPath(); ctx.arc(sx + ox, my + oy, r * 0.52, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8c979c'; ctx.beginPath(); ctx.arc(sx + ox, my + oy, r * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.font = `bold ${Math.max(3, Math.round(h * 0.34))}px monospace`; ctx.fillStyle = '#1c2226';
      ctx.fillText(g.lado, sx + ox, my + oy + 0.3);
      if (g.veces > 1) { ctx.font = FUENTE(h); ctx.fillStyle = '#e8a33d'; ctx.fillText('×' + g.veces, cx + w - 4, my + 0.5); }
    } else if (g.k === 'cara') {
      const r = h / 2 - 0.5;
      ctx.fillStyle = '#2b3337'; ctx.beginPath(); ctx.arc(cx + w / 2, my, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#7f9099'; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.font = FUENTE(h); ctx.fillStyle = '#e8eef0'; ctx.fillText(g.t, cx + w / 2, my + 0.5);
    } else if (g.k === 'hombro') {
      ctx.fillStyle = '#2b3337'; redondo(cx, y + 1, w, h - 2, 3); ctx.fill();
      ctx.strokeStyle = '#7f9099'; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.font = FUENTE(h); ctx.fillStyle = '#e8eef0'; ctx.fillText(g.t, cx + w / 2, my + 0.5);
    } else if (g.k === 'cruceta') {
      const a = h / 3, ox = cx + (w - a * 3) / 2, oy = y + (h - a * 3) / 2;
      ctx.fillStyle = '#2b3337'; ctx.fillRect(ox + a, oy, a, a * 3); ctx.fillRect(ox, oy + a, a * 3, a);
      const p = { u: [1, 0], d: [1, 2], l: [0, 1], r: [2, 1] }[g.dir];
      ctx.fillStyle = '#e8a33d'; ctx.fillRect(ox + p[0] * a, oy + p[1] * a, a, a);
    } else {
      ctx.font = `${Math.max(4, Math.round(h * 0.5))}px monospace`; ctx.fillStyle = col;
      ctx.fillText(g.t, cx + w / 2, my + 0.5);
    }
    cx += w;
  });
  ctx.restore();
  return cx - x;
}
