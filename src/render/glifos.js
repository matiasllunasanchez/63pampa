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
  // EL GESTO DE LA BOMBA (21/11, el autor: "en controles tiene que ser la sensacion de R hacia abajo, mantiene: hacer
  // el gesto"): «stick der ↓ + R3» es UNA perilla que baja, se queda abajo y se hunde (el clic), no dos mandos sueltos
  const gesto = pad && grupos.length === 1 && /\bstick\b/i.test(grupos[0]) && /\b[RL]3\b/.test(grupos[0]);
  if (gesto) {
    const st = glifosDe(grupos[0].split('+')[0].trim(), true)[0];
    if (st && st.k === 'stick') return [{ ...st, mantiene: true, clic: true }];
  }
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

// LAS PIRUETAS DIBUJADAS (21/11, el autor: "un listado prolijo con todas las combinaciones, con los sticks y las
// presiones de botones o teclas, con velocidad, veces o mantener: tiene que ser claro"). El combo de data/moves.js
// (`COMBO` / `COMBO_PAD`) → glifos: las flechas son la mano derecha (teclas de flecha, o el stick DERECHO en el
// joystick), «izq↓»/«der←» un stick puntual, «[G]» una tecla, «⟳» rolando, «⟶» despues, «mirar ↓» mantener mirando.
// Devuelve { gl, espejo, cond }: `espejo` = tiene la version para el otro lado (·), `cond` = lo que va entre parentesis.
// El «·» de un combo es DOS COSAS: el mismo combo para el otro lado (TONEL «→→ · ←←») o OTRA FORMA de pedirlo
// (COBRA «[G] · ⟳↑↓↑»). Si la segunda es la primera espejada, va una sola y «o al revés»; si no, las dos con una «o».
// (izq/der NO se espejan: son la MANO —el stick—, no el lado al que va el avion)
const ESPEJO = { '←': '→', '→': '←', Q: 'E', E: 'Q', A: 'D', D: 'A' };
const espejar = s => s.replace(/[←→QEAD]/g, c => ESPEJO[c] || c);
export function comboGlifos(str, pad) {
  const alts = String(str || '').split('·').map(s => s.trim()).filter(Boolean);
  const sinPar = x => x.replace(/\s*\([^)]*\)/g, '').trim();
  const espejo = alts.length > 1 && sinPar(alts[1]) === espejar(sinPar(alts[0]));
  if (alts.length > 1 && !espejo) {
    const a = comboGlifos(alts[0], pad), b = comboGlifos(alts.slice(1).join(' · '), pad);
    return { gl: [...a.gl, { k: 'txt', t: 'o' }, ...b.gl], espejo: false, cond: a.cond, uno: a };
  }
  const uno = alts[0] || '', cond = (/\(([^)]*)\)/.exec(uno) || [])[1] || null;
  const s = sinPar(uno);
  const gl = [];
  const re = /\[[^\]]+\]|mirar\s*[↑↓]|izq[↑↓←→]|der[↑↓←→]|⟳|⟶|→ (?=[↑↓])|[↑↓←→]|\+|\by\b|[A-Z]\b|◄|►/g;
  let m;
  while ((m = re.exec(s))) {
    const k = m[0];
    if (k[0] === '[') {
      const adentro = k.slice(1, -1);
      if (pad && /[+]/.test(adentro)) gl.push(...glifosDe(adentro.replace(/\+/g, ' + '), true));
      else if (adentro === '◄' || adentro === '►') gl.push({ k: 'cruceta', dir: adentro === '◄' ? 'l' : 'r' });
      else gl.push(pad && HOMBRO.test(adentro) ? { k: 'hombro', t: adentro } : { k: 'tecla', t: adentro });
    } else if (k.startsWith('mirar')) {
      const d = FLECHA[k.slice(-1)];
      gl.push(pad ? { k: 'stick', lado: 'R', dirs: [d], veces: 1, hold: true } : { k: 'tecla', t: k.slice(-1), hold: true });
    } else if (/^(izq|der)/.test(k)) gl.push({ k: 'stick', lado: k.startsWith('izq') ? 'L' : 'R', dirs: [FLECHA[k.slice(-1)]], veces: 1 });
    else if (k === '⟳') gl.push({ k: 'rola' });
    else if (k === '⟶' || k.startsWith('→ ')) gl.push({ k: 'txt', t: '›' });
    else if (FLECHA[k]) gl.push(pad ? { k: 'stick', lado: 'R', dirs: [FLECHA[k]], veces: 1 } : { k: 'tecla', t: k });
    else if (k === '+' || k === 'y') gl.push({ k: 'txt', t: k });
    else gl.push({ k: 'tecla', t: k });
  }
  return { gl, espejo, cond };
}

// EL RITMO (21/11, el autor: "la frecuencia y velocidad de como deben presionarse, con efecto de presion con fondo
// amarillo en la tecla"): los mandos se APRIETAN solos, en orden y al tiempo real del juego — un toque cada 0,2 s (el
// detector de combos acepta hasta 0,28 s entre toques, core/input.js `COMBO_WIN`), los unidos con «+» juntos, lo que
// se sostiene (`hold`, «sostener») queda apretado, y una pausa antes de volver a empezar.
const APRETABLE = new Set(['tecla', 'stick', 'cara', 'hombro', 'cruceta', 'rola']);
function apretados(lista, t) {
  // (21/11, el autor: "las teclas que son O hacerlas A LA VEZ; si es una sola tecla el efecto de apretar no hace falta,
  // queda estatica"): la lista se parte en ALTERNATIVAS (la barrita · o la «o»), y todas corren JUNTAS en el mismo reloj.
  // Adentro de cada una: lo unido con «+» se aprieta junto, una secuencia toque a toque, y UNA tecla sola no se mueve.
  const grupos = [[]];
  lista.forEach((g, i) => { if (g.k === 'sep' || (g.k === 'txt' && g.t === 'o')) grupos.push([]); else grupos[grupos.length - 1].push([g, i]); });
  const planes = grupos.map(gr => {
    const pasos = [];
    let junto = false;
    for (const [g, i] of gr) {
      if (g.k === 'txt' && g.t === '+') { junto = true; continue; }
      if (g.k === 'txt' && /sosten|hold/i.test(g.t) && pasos.length) { pasos[pasos.length - 1].dur = 1.2; pasos[pasos.length - 1].largo = true; continue; }
      if (g.k === 'txt' && g.t === '›') { pasos.push({ idx: [], dur: 0.3 }); continue; }
      if (!APRETABLE.has(g.k) || g.mantiene) continue;
      if (junto && pasos.length && pasos[pasos.length - 1].idx.length) { const p = pasos[pasos.length - 1]; p.idx.push(i); p.dur = Math.max(p.dur, 0.6); p.largo = true; }
      else pasos.push({ idx: [i], dur: g.hold ? 0.5 : g.k === 'rola' ? 0.6 : 0.2, hold: !!g.hold, largo: g.k === 'rola' });
      junto = false;
    }
    // una sola tecla, sin mantener: estatica
    const conMando = pasos.filter(p => p.idx.length);
    if (conMando.length === 1 && conMando[0].idx.length === 1 && !conMando[0].largo && !conMando[0].hold) return null;
    return conMando.length ? pasos : null;
  }).filter(Boolean);
  const set = new Set();
  if (!planes.length) return set;
  const total = Math.max(...planes.map(ps => ps.reduce((a, p) => a + p.dur, 0))) + 0.9;
  const ph = t % total;
  for (const pasos of planes) {
    let ya = 0;
    for (const p of pasos) {
      if (p.hold && ph >= ya) p.idx.forEach(i => set.add(i));   // lo que se mantiene sigue apretado hasta el final
      if (ph >= ya && ph < ya + p.dur && ph - ya < (p.largo ? p.dur - 0.08 : 0.13)) p.idx.forEach(i => set.add(i));
      ya += p.dur;
    }
  }
  return set;
}

const FUENTE = h => `bold ${Math.max(4, Math.round(h * 0.55))}px monospace`;

/** EL MANDO DE «CONTINUAR» (21/11, el autor: "reemplazar PRESIONA CUALQUIER TECLA PARA CONTINUAR por CONTINUAR, con un
 *  dibujo de TECLA o de BOTON DE JOYSTICK sin ninguna indicacion, con el efecto de presionar, repitiendolo"): una tecla
 *  en blanco (o un boton redondo sin simbolo) que se aprieta sola una y otra vez. `x, y` arriba a la izquierda; devuelve
 *  el ancho. */
export function teclaGenerica(x, y, h, t, pad) {
  const aprieta = (t * 1.25) % 1 < 0.22;
  ctx.save();
  if (pad) {
    const r = h / 2 - 0.5, cx = x + h / 2, my = y + h / 2 + (aprieta ? 0.6 : 0);
    ctx.fillStyle = '#1c2226'; ctx.beginPath(); ctx.arc(cx, y + h / 2 + 1, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = aprieta ? '#e8a33d' : '#2b3337'; ctx.beginPath(); ctx.arc(cx, my, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7f9099'; ctx.lineWidth = 0.8; ctx.stroke();
  } else {
    const w = h * 1.5, dy = aprieta ? 1 : 0;
    ctx.fillStyle = '#5b666c'; redondo(x, y + 1, w, h - 1, 1.6); ctx.fill();
    ctx.fillStyle = aprieta ? '#e8a33d' : '#d9dfe2'; redondo(x, y + dy, w, h - 2 - dy, 1.6); ctx.fill();
    ctx.restore();
    return w;
  }
  ctx.restore();
  return h;
}
const AIRE = 1;   // (21/11, "linea visual mas corta": menos aire entre mandos)
/** Cuanto mide cada glifo de ancho, con el alto `h`. */
function ancho(g, h) {
  if (g.k === 'sep') return 3;
  if (g.k === 'stick') return h + (g.dirs.length ? 2 : 0) + (g.veces > 1 ? 8 : 0);
  if (g.k === 'cara' || g.k === 'cruceta' || g.k === 'rola') return h;
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
export function dibujar(lista, x, y, h, t = 0, col = '#e8eef0', ritmo = false) {
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let cx = x;
  const ap = ritmo ? apretados(lista, t) : null;
  lista.forEach((g, i) => {
    if (i) cx += AIRE;
    const w = ancho(g, h), aprieta = !!(ap && ap.has(i));
    // apretada: hundida un punto
    if (aprieta && g.k !== 'stick') y += 1;
    const my = y + h / 2;
    if (g.k === 'sep') {
      ctx.fillStyle = '#5d6a71'; ctx.fillRect(Math.round(cx + w / 2), Math.round(y + h * 0.3), 1, Math.max(2, Math.round(h * 0.4)));
    } else if (g.k === 'tecla') {
      // LA TECLA: la tapa clara, el borde de abajo mas oscuro (la profundidad) y la letra
      ctx.fillStyle = '#5b666c'; redondo(cx, y + 1, w, h - 1, 1.6); ctx.fill();
      ctx.fillStyle = aprieta ? '#e8a33d' : '#d9dfe2'; redondo(cx, y, w, h - (aprieta ? 3 : 2), 1.6); ctx.fill();
      if (FLECHA[g.t]) flecha(cx + w / 2, y + (h - 2) / 2, FLECHA[g.t], 0.4, '#1c2226');
      else { ctx.font = FUENTE(h); ctx.fillStyle = '#1c2226'; ctx.fillText(g.t, cx + w / 2, y + (h - 2) / 2 + 0.5); }
    } else if (g.k === 'stick') {
      // LA PERILLA: el aro de la base y el hongo, corrido (y yendo y viniendo) hacia donde se mueve
      const r = h / 2 - 0.5, sx = cx + (w - (g.veces > 1 ? 8 : 0)) / 2;
      ctx.fillStyle = '#2b3337'; ctx.beginPath(); ctx.arc(sx, my, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#7f9099'; ctx.lineWidth = 0.8; ctx.stroke();
      for (const d of g.dirs) flecha(sx, my, d, r + 0.3, '#e8a33d');
      // a donde va el hongo: recorre las direcciones, de a una
      let ox = 0, oy = 0, hunde = false;
      if (ap && !g.mantiene) {
        // con RITMO el hongo va a su direccion solo mientras se aprieta (y se pinta de amarillo)
        const d = g.dirs[0], k = aprieta ? r * 0.42 : 0;
        ox = d === 'l' ? -k : d === 'r' ? k : 0; oy = d === 'u' ? -k : d === 'd' ? k : 0;
        hunde = aprieta && !g.dirs.length;
      } else if (g.mantiene && g.dirs.length) {
        // baja, SE QUEDA abajo, se hunde (el clic) y vuelve: un ciclo cada ~1,8 s
        const p = (t * 0.55) % 1, d = g.dirs[0];
        const k = (p < 0.12 ? p / 0.12 : p < 0.86 ? 1 : Math.max(0, (1 - p) / 0.14)) * r * 0.42;
        ox = d === 'l' ? -k : d === 'r' ? k : 0; oy = d === 'u' ? -k : d === 'd' ? k : 0;
        hunde = g.clic && p > 0.45 && p < 0.66;
        if (hunde) { ctx.strokeStyle = '#e8a33d'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(sx, my, r + 1.2, 0, Math.PI * 2); ctx.stroke(); }
      } else if (g.dirs.length) {
        const d = g.dirs[Math.floor(t * 1.4) % g.dirs.length], k = Math.min(1, (t * 1.4 % 1) * 3) * r * 0.42;
        ox = d === 'l' ? -k : d === 'r' ? k : 0; oy = d === 'u' ? -k : d === 'd' ? k : 0;
      }
      // (hundido: el hongo mas chico y en el color del clic, y dice R3)
      ctx.fillStyle = hunde || (ap && aprieta) ? '#e8a33d' : '#c9d1d5'; ctx.beginPath(); ctx.arc(sx + ox, my + oy, r * (hunde ? 0.44 : 0.52), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = hunde ? '#a86f1c' : '#8c979c'; ctx.beginPath(); ctx.arc(sx + ox, my + oy, r * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.font = `bold ${Math.max(3, Math.round(h * 0.34))}px monospace`; ctx.fillStyle = '#1c2226';
      ctx.fillText(hunde ? g.lado + '3' : g.lado, sx + ox, my + oy + 0.3);
      if (g.veces > 1) { ctx.font = FUENTE(h); ctx.fillStyle = '#e8a33d'; ctx.fillText('×' + g.veces, cx + w - 4, my + 0.5); }
    } else if (g.k === 'cara') {
      const r = h / 2 - 0.5;
      ctx.fillStyle = aprieta ? '#e8a33d' : '#2b3337'; ctx.beginPath(); ctx.arc(cx + w / 2, my, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#7f9099'; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.font = FUENTE(h); ctx.fillStyle = aprieta ? '#1c2226' : '#e8eef0'; ctx.fillText(g.t, cx + w / 2, my + 0.5);
    } else if (g.k === 'hombro') {
      ctx.fillStyle = aprieta ? '#e8a33d' : '#2b3337'; redondo(cx, y + 1, w, h - 2, 3); ctx.fill();
      ctx.strokeStyle = '#7f9099'; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.font = FUENTE(h); ctx.fillStyle = aprieta ? '#1c2226' : '#e8eef0'; ctx.fillText(g.t, cx + w / 2, my + 0.5);
    } else if (g.k === 'rola') {
      // ROLANDO: una flecha en circulo; mientras «se aprieta», gira
      const r = h / 2 - 1.2, a0 = aprieta ? t * 9 : 0.6;
      ctx.strokeStyle = aprieta ? '#e8a33d' : '#9fb3c0'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.arc(cx + w / 2, my, r, a0, a0 + Math.PI * 1.5); ctx.stroke();
      const ex = cx + w / 2 + Math.cos(a0 + Math.PI * 1.5) * r, ey = my + Math.sin(a0 + Math.PI * 1.5) * r;
      ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.arc(ex, ey, 1.2, 0, Math.PI * 2); ctx.fill();
    } else if (g.k === 'cruceta') {
      const a = h / 3, ox = cx + (w - a * 3) / 2, oy = y + (h - a * 3) / 2;
      ctx.fillStyle = '#2b3337'; ctx.fillRect(ox + a, oy, a, a * 3); ctx.fillRect(ox, oy + a, a * 3, a);
      const p = { u: [1, 0], d: [1, 2], l: [0, 1], r: [2, 1] }[g.dir];
      ctx.fillStyle = aprieta ? '#ffd27a' : '#e8a33d'; ctx.fillRect(ox + p[0] * a, oy + p[1] * a, a, a);
    } else {
      ctx.font = `${Math.max(4, Math.round(h * 0.5))}px monospace`; ctx.fillStyle = col;
      ctx.fillText(g.t, cx + w / 2, my + 0.5);
    }
    if (aprieta && g.k !== 'stick') y -= 1;
    cx += w;
  });
  ctx.restore();
  return cx - x;
}
