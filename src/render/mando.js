// EL MANDO DIBUJADO (21/11, el autor: "antes de arrancar, mostrar el joystick para indicar cual es todo. O teclado").
//
// Una lamina en el diseño 320x180: el joystick (o el teclado) dibujado en el medio, y cada boton con una raya hasta
// su rotulo — lo que hace. Sale en la primera pausa de la etapa 1 del tutorial (data/tutorial.js `mando`) encima del
// velo, y el dialogo de abajo la presenta. Los NOMBRES salen de la tabla `ctrl*` (data/strings.js), la misma de
// CONTROLES: si un boton cambia de lugar alla, el rotulo de aca lo sigue.
//
// No sabe si hay un joystick enchufado: se lo dicen (`pad`).
import { ctx, DW as W, DH as H } from './ctx.js';
import { P } from '../data/palette.js';
import { T } from '../core/i18n.js';

const BORDE = '#7f9099', TINTA = '#1c2226';

// EL JOYSTICK DE XBOX (22/11, el autor, con una lamina de referencia: "quiero que la imagen del joystick sea similar a
// esta, usemos uno de xbox"): el mando claro en el medio, chico, y alrededor CADA BOTON DIBUJADO EN GRANDE con su
// rotulo al lado — gatillos y bombers arriba, los cuatro botones de colores a la derecha, los sticks con sus flechas,
// la cruceta abajo. Sin rayas: el dibujo del boton ya dice cual es. Las acciones son las de siempre (tabla `ctrl*`).
//   k: 'gat' gatillo · 'bum' bomper · 'cara' boton de color · 'stick' · 'cruz' cruceta · 'menu' START
const PAD = [
  { k: 'gat', t: 'LT', x: 30, y: 40, ac: ['Mant'] },
  { k: 'bum', t: 'LB', x: 30, y: 51, ac: [] },   // (27/11: LB ya no suelta el secundario)
  { k: 'stick', t: 'L', x: 30, y: 66, dirs: 'udlr', ac: ['Fly', 'Gas', 'Dive'], l3: true },
  { k: 'cruz', x: 30, y: 92, ac: ['Secund', 'Chancha', 'Eyecta'] },
  { k: 'menu', t: 'START', x: 160, y: 40, ac: ['Pause'], centro: true },
  { k: 'gat', t: 'RT', x: 232, y: 40, ac: ['Boost'] },
  { k: 'bum', t: 'RB', x: 232, y: 51, ac: ['Tempo'] },
  { k: 'cara', t: 'Y', c: '#f2c230', x: 232, y: 62, ac: ['Radar'] },
  { k: 'cara', t: 'B', c: '#e8463a', x: 232, y: 71, ac: ['Chapitas'] },
  { k: 'cara', t: 'X', c: '#3a8ee8', x: 232, y: 80, ac: ['Msl'] },
  { k: 'cara', t: 'A', c: '#4cc35a', x: 232, y: 89, ac: ['Gun'] },
  { k: 'stick', t: 'R', x: 232, y: 103, dirs: 'udlr', ac: ['Roll', 'MiraB'], r3: true },
];
const CLARO = '#dfe4e6', SOMBRA = '#a9b2b6', LINEA = '#1c2226';

// EL TECLADO: las teclas que importan, en su lugar aproximado de un teclado comun (columna, fila), y su accion
const TECLAS = [
  // (22/11, el autor: "la mano izquierda sobre WASD y la derecha sobre las flechitas, para generar lo mismo que los
  // sticks; todo el resto alrededor"): el teclado es un joystick — ver KEYMAP_LIBRE en core/input.js
  { t: 'ESC', c: 0, f: 0, ac: 'Pause' }, { t: '1', c: 1, f: 0, ac: 'Secund' }, { t: '3', c: 3, f: 0, ac: 'Chancha' },
  { t: 'Q', c: 1, f: 1, ac: 'Msl' }, { t: 'W', c: 2, f: 1, ac: 'Gas' }, { t: 'E', c: 3, f: 1, ac: 'Tempo' }, { t: 'R', c: 4, f: 1, ac: 'Chapitas' },
  { t: 'A', c: 1.3, f: 2, ac: 'Fly' }, { t: 'S', c: 2.3, f: 2, ac: 'Dive' }, { t: 'D', c: 3.3, f: 2, ac: 'Fly' }, { t: 'F', c: 4.3, f: 2, ac: 'Radar' },
  { t: 'SHIFT', c: 0, f: 3, w: 1.8, ac: 'Mant' }, { t: 'ESPACIO', c: 2.6, f: 4, w: 4.2, ac: 'Gun' },
  // la mano derecha: las flechas son el stick derecho, y alrededor los botones de la derecha
  // (23/11, el autor: SHIFT der la poscombustion y ENTER la bomba)
  { t: 'ENTER', c: 8.6, f: 1.5, w: 1.8, ac: 'TiraB' }, { t: 'SHIFT', c: 8, f: 3, w: 2, ac: 'Boost' },
  { t: 'CTRL', c: 8.4, f: 4, w: 1.6, ac: 'Gun' },
  { t: '↑', c: 11, f: 3, ac: 'Pan' }, { t: '←', c: 10, f: 4, ac: 'Roll' }, { t: '↓', c: 11, f: 4, ac: 'MiraB' }, { t: '→', c: 12, f: 4, ac: 'Roll' },
  // la cruceta, en el numpad
  { t: '8', c: 14, f: 1, ac: 'Secund' }, { t: '4', c: 13, f: 2, ac: 'Brake' }, { t: '6', c: 15, f: 2, ac: 'Chancha' }, { t: '2', c: 14, f: 3, ac: 'Cam' },
];
// el color de cada familia de accion (vuelo, armas, el resto), igual en el teclado y en su leyenda
const FAMILIA = { Fly: 0, Gas: 0, Dive: 0, Direccion: 0, Mant: 0, Brake: 0, Roll: 0, Pan: 0, Boost: 0, Gun: 1, Msl: 1, MiraB: 1, TiraB: 1, Secund: 1, Chapitas: 1 };
const COLORES = ['#e8a33d', '#ff6a5a', '#6fe3ff'];
const colorDe = ac => COLORES[FAMILIA[ac] ?? 2];

function redondo(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

/** La lamina entera. `pad` = joystick (si no, teclado); `t` = reloj (s) para el latido; `a` = alfa de entrada (0..1).
 *  `completo`: el TECLADO ENTERO, con las teclas que se usan resaltadas y el resto en gris (CONTROLES › DISPOSICION). */
export function drawMando({ pad, t = 0, a = 1, completo = false }) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.textBaseline = 'middle';
  // el titulo
  ctx.textAlign = 'center'; ctx.font = 'bold 7px monospace'; ctx.fillStyle = P.accent;
  ctx.fillText(T(pad ? 'mandoTituloPad' : 'mandoTituloKb'), W / 2, 24);
  ctx.font = '4px monospace'; ctx.fillStyle = P.dim;
  ctx.fillText(T('mandoNota'), W / 2, 31);
  if (pad) dibujarPad(t); else if (completo) dibujarTecladoCompleto(); else dibujarTeclado(t);
  ctx.restore();
}

// EL TECLADO ENTERO (22/11, el autor: "en CONTROLES, una pestaña DISPOSICION con el joystick del tutorial; y muestra
// TECLADO y JOYSTICK, resaltando en el teclado las teclas que participan, el resto solo grises"). La distribucion es
// la de un teclado de verdad (bloque principal, flechas y numpad); que tecla hace que sale de TECLAS, la misma lista de
// la lamina del tutorial, asi no hay dos versiones de los controles.
const COMPLETO = (() => {
  const k = [], fila = (f, c0, ts, w = 1) => ts.forEach((t, i) => k.push({ id: t, t, c: c0 + i * w, f, w }));
  k.push({ id: 'ESC', t: 'ESC', c: 0, f: 0 }); fila(0, 1.5, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']);
  k.push({ id: 'TAB', t: 'TAB', c: 0, f: 1, w: 1.5 }); fila(1, 1.5, ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']);
  k.push({ id: 'ENTER', t: 'ENTER', c: 11.5, f: 1, w: 1.6 });
  k.push({ id: 'CAPS', t: 'CAPS', c: 0, f: 2, w: 1.8 }); fila(2, 1.8, ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ']);
  k.push({ id: 'LSHIFT', t: 'SHIFT', c: 0, f: 3, w: 2.3 }); fila(3, 2.3, ['Z', 'X', 'C', 'V', 'B', 'N', 'M']);
  k.push({ id: 'RSHIFT', t: 'SHIFT', c: 9.3, f: 3, w: 3.8 });
  k.push({ id: 'LCTRL', t: 'CTRL', c: 0, f: 4, w: 1.5 }, { id: 'LALT', t: 'ALT', c: 1.5, f: 4, w: 1.3 },
    { id: 'SPACE', t: 'ESPACIO', c: 2.8, f: 4, w: 6.4 }, { id: 'RALT', t: 'ALT', c: 9.2, f: 4, w: 1.3 }, { id: 'RCTRL', t: 'CTRL', c: 10.5, f: 4, w: 1.6 });
  k.push({ id: 'UP', t: '↑', c: 14.6, f: 3 }, { id: 'LEFT', t: '←', c: 13.6, f: 4 }, { id: 'DOWN', t: '↓', c: 14.6, f: 4 }, { id: 'RIGHT', t: '→', c: 15.6, f: 4 });
  [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3']].forEach((r, i) => r.forEach((t, j) => k.push({ id: 'N' + t, t, c: 17.4 + j, f: 1 + i })));
  k.push({ id: 'N0', t: '0', c: 17.4, f: 4, w: 2 });
  return k;
})();
const FLECHA_ID = { '↑': 'UP', '←': 'LEFT', '↓': 'DOWN', '→': 'RIGHT' };
/** La tecla de TECLAS → su id en el teclado entero (SHIFT y CTRL por lado, los numeros del numpad aparte). */
const idDe = k => k.t === 'SHIFT' ? (k.c < 5 ? 'LSHIFT' : 'RSHIFT') : k.t === 'CTRL' ? (k.c < 5 ? 'LCTRL' : 'RCTRL')
  : k.t === 'ESPACIO' ? 'SPACE' : FLECHA_ID[k.t] || (/^\d$/.test(k.t) && k.c >= 13 ? 'N' + k.t : k.t);
function dibujarTecladoCompleto() {
  const K = 8.4, ancho = 20.4 * K, x0 = Math.round((W - ancho) / 2), y0 = 40;
  const usa = new Map();
  for (const k of TECLAS) if (!usa.has(idDe(k))) usa.set(idDe(k), k.ac);
  ctx.fillStyle = '#151b1f'; ctx.strokeStyle = BORDE; ctx.lineWidth = 0.6;
  redondo(x0 - 3, y0 - 3, ancho + 6, K * 5 + 5, 3); ctx.fill(); ctx.stroke();
  for (const k of COMPLETO) {
    const ac = usa.get(k.id), x = x0 + k.c * K, y = y0 + k.f * K, w = (k.w || 1) * K - 1.6;
    ctx.fillStyle = ac ? '#5b666c' : '#1d2428'; redondo(x, y + 1, w, K - 2.6, 1.4); ctx.fill();
    ctx.fillStyle = ac ? '#d9dfe2' : '#2b3439'; redondo(x, y, w, K - 3.4, 1.4); ctx.fill();
    if (ac) { ctx.fillStyle = colorDe(ac); ctx.fillRect(x + 1, y + K - 5.4, w - 2, 1.1); }
    ctx.textAlign = 'center'; ctx.font = `bold ${k.t.length > 2 ? 2.9 : 4}px monospace`; ctx.fillStyle = ac ? TINTA : '#56636a';
    ctx.fillText(k.t, x + w / 2, y + (K - 3.4) / 2);
  }
  // LA LEYENDA, abajo: cada accion con su color y sus teclas (la tabla de CONTROLES)
  const vistos = [...new Set(TECLAS.map(k => k.ac))], cols = 4, cw = ancho / cols, yl = y0 + K * 5 + 9;
  ctx.textAlign = 'left';
  vistos.forEach((ac, i) => {
    const x = x0 + (i % cols) * cw, y = yl + Math.floor(i / cols) * 10;
    ctx.fillStyle = colorDe(ac); ctx.fillRect(x, y - 1.5, 3, 3);
    ctx.font = 'bold 4px monospace'; ctx.fillText(T('ctrl' + ac), x + 5, y, cw - 7);
    ctx.font = '3.4px monospace'; ctx.fillStyle = P.dim; ctx.fillText(T('ctrl' + ac + 'K'), x + 5, y + 4.2, cw - 7);
  });
  // CON LA MANO EN EL MOUSE (23/11): lo que cambia, debajo. Se prende solo al mover el mouse en vuelo (core/input.js)
  const ym = yl + Math.ceil(vistos.length / cols) * 10 + 3;
  ctx.fillStyle = BORDE; ctx.fillRect(x0, ym - 4, ancho, 0.4);
  ctx.font = 'bold 4px monospace'; ctx.fillStyle = P.accent; ctx.fillText(T('mandoMouseTit'), x0, ym);
  ctx.font = '3.6px monospace'; ctx.fillStyle = '#c9d2d6';
  ctx.fillText(T('mandoMouse1'), x0, ym + 5.5, ancho);
  ctx.fillText(T('mandoMouse2'), x0, ym + 10.5, ancho);
}

function flechita(x, y, d, col) {
  const [ux, uy] = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[d], sx = -uy, sy = ux;
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x + ux * 1.8, y + uy * 1.8); ctx.lineTo(x + sx * 1.4, y + sy * 1.4); ctx.lineTo(x - sx * 1.4, y - sy * 1.4);
  ctx.closePath(); ctx.fill();
}

/** EL MANDO del medio: cuerpo claro con las dos manijas, y sus botones en chiquito (los de color, en color). */
function cuerpoXbox(cx, cy) {
  ctx.lineWidth = 0.8; ctx.strokeStyle = LINEA;
  // los gatillos y bompers, asomando por arriba
  ctx.fillStyle = SOMBRA;
  for (const s of [-1, 1]) { redondo(cx + s * 24 - 7, cy - 21, 14, 6, 2.5); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = '#8c969b';
  for (const s of [-1, 1]) { redondo(cx + s * 22 - 8, cy - 17, 16, 4, 1.8); ctx.fill(); ctx.stroke(); }
  // el cuerpo: la panza y las dos manijas
  ctx.fillStyle = CLARO;
  ctx.beginPath(); ctx.ellipse(cx - 22, cy + 10, 11, 17, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx + 22, cy + 10, 11, 17, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  redondo(cx - 33, cy - 15, 66, 24, 10); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx - 22, cy + 10, 10.2, 16.2, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 22, cy + 10, 10.2, 16.2, -0.4, 0, Math.PI * 2); ctx.fill();
  redondo(cx - 32.2, cy - 14.2, 64.4, 22.4, 9.4); ctx.fill();
  // la luz del boton del medio y BACK / START
  ctx.fillStyle = '#f4f7f8'; ctx.beginPath(); ctx.arc(cx, cy - 8, 3.4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = SOMBRA; ctx.lineWidth = 0.5; ctx.stroke();
  ctx.fillStyle = SOMBRA;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + s * 7, cy - 2, 1.5, 0, Math.PI * 2); ctx.fill(); }
  // los sticks (izquierdo arriba, derecho abajo, como el de Xbox) y la cruceta
  const stick = (x, y) => {
    ctx.fillStyle = '#3a4246'; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#20272a'; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, Math.PI * 2); ctx.fill();
  };
  stick(cx - 20, cy - 5); stick(cx + 9, cy + 6);
  ctx.fillStyle = '#3a4246'; ctx.fillRect(cx - 11, cy + 1, 3, 9); ctx.fillRect(cx - 14, cy + 4, 9, 3);
  // los cuatro de color
  for (const [dx, dy, c] of [[0, -4, '#f2c230'], [4, 0, '#e8463a'], [-4, 0, '#3a8ee8'], [0, 4, '#4cc35a']]) {
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx + 21 + dx, cy - 5 + dy, 1.9, 0, Math.PI * 2); ctx.fill();
  }
}

/** UN BOTON EN GRANDE (el de la columna, con su rotulo al lado). Devuelve donde arranca el texto. */
function botonGrande(b, t) {
  const { x, y } = b;
  ctx.lineWidth = 0.7; ctx.strokeStyle = LINEA;
  if (b.k === 'gat') {
    // el gatillo: una pala de costado, clara, con su nombre abajo
    ctx.fillStyle = CLARO; ctx.beginPath();
    ctx.moveTo(x - 4, y + 4); ctx.lineTo(x - 4, y + 1); ctx.quadraticCurveTo(x - 2, y - 4, x + 1, y - 5);
    ctx.lineTo(x + 3, y - 5); ctx.lineTo(x + 4, y + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
    etiqueta(b.t, x + 0.5, y + 1.8, 2.8, '#5b666c');
    return x + 8;
  }
  if (b.k === 'bum') {
    ctx.fillStyle = CLARO; redondo(x - 6, y - 2.5, 12, 5, 2); ctx.fill(); ctx.stroke();
    etiqueta(b.t, x + 1.5, y + 0.2, 2.8, '#5b666c');
    return x + 9;
  }
  if (b.k === 'cara') {
    ctx.fillStyle = b.c; ctx.beginPath(); ctx.arc(x, y, 3.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    etiqueta(b.t, x, y + 0.3, 4.2, '#ffffff');
    return x + 7;
  }
  if (b.k === 'menu') {
    ctx.fillStyle = CLARO; redondo(x - 4, y - 2.5, 8, 5, 2.5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = LINEA; for (let i = -1; i <= 1; i++) ctx.fillRect(x - 1.6, y - 0.25 + i * 1.2, 3.2, 0.5);
    return x + 7;
  }
  if (b.k === 'stick') {
    // la perilla con sus cuatro flechas rojas, y el hongo que va y viene
    ctx.fillStyle = '#3a4246'; ctx.beginPath(); ctx.arc(x, y, 5.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (const d of b.dirs) {
      const [ux, uy] = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[d];
      flechita(x + ux * 6.6, y + uy * 6.6, d, '#e8463a');
    }
    const fase = Math.floor(t * 1.1) % 4, dd = 'urdl'[fase], k = Math.min(1, (t * 1.1 % 1) * 3) * 1.4;
    const [ox, oy] = { u: [0, -k], d: [0, k], l: [-k, 0], r: [k, 0] }[dd];
    ctx.fillStyle = '#5b666c'; ctx.beginPath(); ctx.arc(x + ox, y + oy, 3.4, 0, Math.PI * 2); ctx.fill();
    etiqueta(b.t, x + ox, y + oy + 0.2, 3.6, '#c9d1d5');
    return x + 10;
  }
  // la cruceta: cuatro brazos, el de arriba encendido
  ctx.fillStyle = '#3a4246';
  ctx.fillRect(x - 1.6, y - 5, 3.2, 10); ctx.fillRect(x - 5, y - 1.6, 10, 3.2);
  ctx.strokeRect(x - 1.6, y - 5, 3.2, 10); ctx.strokeRect(x - 5, y - 1.6, 10, 3.2);
  ctx.fillStyle = '#3a4246'; ctx.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
  ctx.fillStyle = '#f4f7f8';
  const brazo = 'urdl'[Math.floor(t * 1.1) % 4];
  const [bx, by] = { u: [0, -3.3], d: [0, 3.3], l: [-3.3, 0], r: [3.3, 0] }[brazo];
  ctx.fillRect(x + bx - 1.1, y + by - 1.1, 2.2, 2.2);
  return x + 8;
}

// EL MANDO DEL AUTOR (22/11): su PNG del joystick de Xbox (assets/ui/mando_xbox.png, 1280x720, sin texto) con una
// RAYA por boton que sale hasta un borde; el texto va FLOTANDO en la punta de cada raya. Las puntas se midieron en la
// imagen (pixeles del PNG). `dx`/`dy` corren el texto. `al`: hacia donde crece el texto desde la punta — 'izq' (termina en la punta), 'der'
// (arranca en la punta), 'arr' (centrado, arriba), 'aba' (centrado, abajo); `dy` corre el bloque. Sin la imagen
// cargada, queda el dibujo de arriba.
const IMG_MANDO = new Image();
let imgMandoOk = false;
IMG_MANDO.onload = () => { imgMandoOk = true; };
IMG_MANDO.src = '../assets/ui/mando_xbox.png';
const MI = { s: 0.095, y: 37 };   // escala del PNG en la lamina (320x180) y su borde de arriba; se centra a lo ancho
const PUNTAS = [
  { px: 122, py: 72, al: 'izq', ac: ['Mant'] },                       // LT: mantener la altura (22/11)
  { px: 53, py: 163, al: 'izq', ac: [] },                            // LB (27/11: ya no suelta el secundario)
  // (23/11, el autor: "reduzcamos el ESQUIVAR y todo el resto solo por DIRECCION DE VUELO"): un renglon
  // (23/11, el autor: "el texto de los botones se esta superponiendo, el de las direcciones y cortar rasante"): el bloque
  // de dos renglones del stick sube y los de la cruceta bajan, para que las placas no se pisen
  { px: 68, py: 374, al: 'izq', ac: ['Direccion'], l3: true, dy: -2.6 },   // stick izquierdo
  { px: 25, py: 446, al: 'izq', ac: ['Secund'], dy: 0.8 },            // cruceta ▲
  { px: 25, py: 485, al: 'izq', ac: ['Eyecta'], dy: 1.9 },            // cruceta ◄ (23/11: dos toques = eyeccion)
  { px: 527, py: 45, al: 'arr', ac: ['Cam'], dx: -8 },                // BACK / SELECT (23/11: la camara)
  { px: 733, py: 45, al: 'arr', ac: ['Pause'] },                      // START
  { px: 1138, py: 76, al: 'der', ac: ['Boost'] },                     // RT
  { px: 1186, py: 158, al: 'der', ac: ['Tempo'] },                    // RB (23/11: momentum)
  { px: 1176, py: 237, al: 'der', ac: ['Especial'] },                 // Y (23/11: el radar; el autor: "la Y seria ACTIVAR ESPECIAL (si tiene)")
  { px: 1250, py: 295, al: 'der', ac: ['Chapitas'] },                 // B
  { px: 1253, py: 355, al: 'der', ac: ['Msl'] },                      // X (23/11: soltar secundaria)
  { px: 1186, py: 415, al: 'der', ac: ['Gun'] },                      // A
  { px: 492, py: 668, al: 'izq', ac: [] },                            // cruceta ▼ (23/11: libre; el rasante paso a L3)
  { px: 545, py: 625, al: 'der', ac: ['Chancha'], dx: -1.8, dy: 4.6 },          // cruceta ►
  { px: 776, py: 680, al: 'der', ac: ['Roll', 'Brake', 'MiraB'], r3: true, flechas: true, dy: -19 },   // stick derecho
];
const FUENTE_P = 3.8, RENGLON = 4.4;

function placa(txt, x, y, al) {
  const w = ctx.measureText(txt).width, x0 = al === 'right' ? x - w : al === 'center' ? x - w / 2 : x;
  ctx.save(); ctx.fillStyle = 'rgba(8,12,15,0.82)'; redondo(x0 - 1.2, y - 2.4, w + 2.4, 4.8, 1.4); ctx.fill(); ctx.restore();
}

// LAS FLECHITAS DEL STICK DERECHO (23/11, el autor: "rolar tiene izquierda y derecha, trayecto de bomba flechita hacia
// abajo"): en la lamina, la direccion del stick antes de la accion
// (y el ▲: EL FRENO, con LT — 23/11, el autor: "si llamas hacia arriba tiene que estar dentro del mismo bloque donde
// estan todos los sentidos y el R3")
const FLECHA_PAD = { Roll: '◄ ► ', Brake: '▲ ', MiraB: '▼ ' };
const TXT_PAD = { Brake: 'mandoFrenoLT' };
function dibujarPadPng() {
  const s = MI.s, w = 1280 * s, ox = (W - w) / 2, oy = MI.y;
  ctx.drawImage(IMG_MANDO, ox, oy, w, 720 * s);
  for (const p of PUNTAS) {
    const x = ox + p.px * s, y = oy + p.py * s;
    const lineas = p.ac.map(ac => [(p.flechas ? FLECHA_PAD[ac] || '' : '') + T(p.flechas && TXT_PAD[ac] || 'ctrl' + ac), colorDe(ac)]);
    if (p.r3) lineas.push([T('mandoR3'), colorDe('TiraB')]);
    if (p.l3) lineas.push([T('mandoL3'), colorDe('Rasante')]);
    if (!lineas.length) lineas.push([T('mandoSinUso'), P.dim]);
    const al = p.al === 'izq' ? 'right' : p.al === 'der' ? 'left' : 'center';
    const tx = (p.al === 'izq' ? x - 1.8 : p.al === 'der' ? x + 1.8 : x) + (p.dx || 0);
    const y0 = (p.al === 'arr' ? y - 3 - (lineas.length - 1) * RENGLON : p.al === 'aba' ? y + 3 : y) + (p.dy || 0);
    ctx.textAlign = al;
    lineas.forEach(([txt, col], k) => {
      ctx.font = (k ? '' : 'bold ') + FUENTE_P + 'px monospace';
      placa(txt, tx, y0 + k * RENGLON, al);
      ctx.fillStyle = col; ctx.fillText(txt, tx, y0 + k * RENGLON);
    });
  }
}

function dibujarPad(t) {
  if (imgMandoOk) { dibujarPadPng(); return; }
  cuerpoXbox(160, 82);
  for (const b of PAD) {
    const xt = botonGrande(b, t);
    const lineas = b.ac.map(ac => T('ctrl' + ac));
    if (b.r3) lineas.push(T('mandoR3'));
    if (b.l3) lineas.push(T('mandoL3'));
    ctx.textAlign = b.centro ? 'left' : 'left';
    lineas.forEach((txt, k) => {
      ctx.font = (k ? '' : 'bold ') + '4.5px monospace';
      ctx.fillStyle = colorDe(b.ac[Math.min(k, b.ac.length - 1)]);
      ctx.fillText(txt, xt, b.y + (lineas.length > 1 ? (k - 0.5) * 5.2 - (lineas.length - 2) * 1.5 : 0));
    });
  }
}

function etiqueta(txt, x, y, px, col = TINTA) {
  ctx.textAlign = 'center'; ctx.font = `bold ${px}px monospace`; ctx.fillStyle = col; ctx.fillText(txt, x, y);
}

function dibujarTeclado(t) {
  const K = 9, x0 = 10, y0 = 42;
  // el fondo: las dos manos, cada una en su tabla
  ctx.fillStyle = '#151b1f'; ctx.strokeStyle = BORDE; ctx.lineWidth = 0.6;
  redondo(x0 - 3, y0 - 3, K * 7 + 6, K * 5 + 6, 3); ctx.fill(); ctx.stroke();
  redondo(x0 + K * 7.8, y0 + K * 0.7, K * 8.4, K * 4.3 + 3, 3); ctx.fill(); ctx.stroke();
  const vistos = new Set();
  for (const k of TECLAS) {
    const x = x0 + k.c * K, y = y0 + k.f * K, w = (k.w || 1) * K - 2, col = colorDe(k.ac);
    ctx.fillStyle = '#5b666c'; redondo(x, y + 1, w, K - 3, 1.6); ctx.fill();
    ctx.fillStyle = '#d9dfe2'; redondo(x, y, w, K - 4, 1.6); ctx.fill();
    ctx.fillStyle = col; ctx.fillRect(x + 1, y + K - 6, w - 2, 1.2);   // la raya de su familia
    ctx.textAlign = 'center'; ctx.font = `bold ${k.t.length > 2 ? 3.2 : 4.5}px monospace`; ctx.fillStyle = TINTA;
    ctx.fillText(k.t, x + w / 2, y + (K - 4) / 2);
    vistos.add(k.ac);
  }
  // LA LEYENDA, a la derecha: cada accion con sus teclas (la misma tabla de CONTROLES)
  const xl = x0 + K * 16.4 + 4;
  ctx.textAlign = 'left';
  // (en dos columnas: en una sola, la lista bajaba hasta la caja del dialogo)
  [...vistos].forEach((ac, i) => {
    const x = xl + Math.floor(i / 7) * 52, y = y0 - 4 + (i % 7) * 9;   // (tres columnas de siete: 22/11)
    ctx.fillStyle = colorDe(ac); ctx.fillRect(x, y - 1.5, 3, 3);
    ctx.font = 'bold 4px monospace'; ctx.fillText(T('ctrl' + ac), x + 5, y);
    ctx.font = '3.6px monospace'; ctx.fillStyle = P.dim; ctx.fillText(T('ctrl' + ac + 'K'), x + 5, y + 4);
  });
}

// ---------------------------------------------------------------------------------------------
// LA BARRITA DEL RASANTE, EN GRANDE (21/11, el autor: "cuando explican rasante estaria bueno que MUESTREN la barrita").
// Mientras Pichon y el Turco la explican, la lamina dibuja el cartelito que sale al lado del avion, cuatro veces mas
// grande y con cada parte rotulada: PERFECTO cargando, despues RASANTE con su surco, el sector azul, la aguja que va y
// viene y el reloj naranja de abajo. Es un dibujo: no lee el estado del juego, se anima solo con `t`.
const RAS_AZUL = '#5ab4ff', SURCO = '#2e3c45';
// `oy`: cuanto se corre hacia abajo (la caja del dialogo cuelga del techo cuando el foco esta en el tablero)
export function drawDemoRasante({ t = 0, a = 1, y0 = 24 }) {
  // (27/11, el autor: "mejora esta forma de mostrarlo, tiene que ser mas intuitivo y no pisarse"): TRES PASOS en fila,
  // numerados y con flechas —1 BAJÁ, 2 GAS EN EL AZUL, 3 LA PALABRA—, en una franja de 56 de alto que game.js ubica
  // entre la caja del dialogo y el tablero (`y0`). El 3 es lo que de verdad pasa en el juego: cada acierto prende una
  // letra de RASANTE, y con la palabra completa el poder es tuyo.
  ctx.save();
  ctx.globalAlpha = a;
  ctx.textBaseline = 'middle';
  const CW = 78, GAP = 10, x1 = (W - (CW * 3 + GAP * 2)) / 2, xs = [x1, x1 + CW + GAP, x1 + 2 * (CW + GAP)];
  const yT = y0 + 6, yB = y0 + 20, yC = y0 + 33;
  // el ciclo de la demo: 4 s de PERFECTO, despues pasadas de la aguja; cada pasada por el azul es un acierto
  const T_CICLO = 4 + 7 * 1.25 + 1.5, tc = t % T_CICLO, fase1 = tc < 4;
  const tg = Math.max(0, tc - 4), f = (tg * 0.8) % 1, pos = f < 0.5 ? f * 2 : 2 - f * 2;
  const sec0 = 0.55, secW = 0.3, enAzul = !fase1 && pos >= sec0 && pos <= sec0 + secW;
  const letras = fase1 ? 0 : Math.min(7, Math.floor(tg / 1.25 + 0.35));
  const titulo = (k, txt, col, on) => {
    ctx.textAlign = 'left'; ctx.font = 'bold 6px monospace'; ctx.fillStyle = on ? col : '#5d6a71';
    ctx.fillText(k + ' · ' + txt, xs[k - 1], yT);
  };
  const nota = (k, txt, col = '#c9d3d7') => {
    ctx.textAlign = 'left'; ctx.font = '4.2px monospace'; ctx.fillStyle = col;
    String(txt).split('\n').forEach((l, i) => ctx.fillText(l, xs[k - 1], yC + i * 5.5));
  };
  // las flechas entre pasos
  ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#5d6a71';
  ctx.fillText('►', xs[1] - GAP / 2, yB); ctx.fillText('►', xs[2] - GAP / 2, yB);
  // 1 · BAJÁ: la carga de PERFECTO
  titulo(1, T('demoRas1'), P.accent, fase1);
  ctx.fillStyle = SURCO; ctx.fillRect(xs[0], yB - 2, CW, 4);
  ctx.fillStyle = P.accent; ctx.fillRect(xs[0], yB - 2, Math.round(CW * (fase1 ? tc / 4 : 1)), 4);
  nota(1, T('demoRas1n'));
  // 2 · GAS EN EL AZUL: la aguja que va y viene
  titulo(2, T('demoRas2'), RAS_AZUL, !fase1);
  ctx.fillStyle = SURCO; ctx.fillRect(xs[1], yB - 4, CW, 8);
  ctx.fillStyle = RAS_AZUL; ctx.fillRect(xs[1] + CW * sec0, yB - 4, CW * secW, 8);
  if (!fase1) { ctx.fillStyle = '#ffffff'; ctx.fillRect(xs[1] + Math.round(pos * (CW - 2)), yB - 6, 2, 12); }
  // EL BOTON DE GAS (27/11, el autor: "mostrar cuando dice GAS presionar el boton de gas hacia arriba"): el stick con su
  // perilla, que SUBE mientras la aguja esta en el azul, y el rotulo ▲ GAS que se prende
  {
    const sx = xs[1] + CW - 6, sy = yC + 3, sube = enAzul ? -3 : 0;
    ctx.strokeStyle = enAzul ? '#ffffff' : '#5d6a71'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = enAzul ? P.accent : '#8a969c'; ctx.beginPath(); ctx.arc(sx, sy + sube, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = 'right'; ctx.font = 'bold 5px monospace'; ctx.fillStyle = enAzul ? P.accent : '#5d6a71';
    ctx.fillText('▲ ' + T('demoRasAhora'), sx - 8, sy);
  }
  nota(2, T('demoRas2n'), '#c9d3d7');
  // 3 · LA PALABRA: una letra por acierto
  titulo(3, T('demoRas3'), RAS_AZUL, letras > 0);
  // (cada letra en su casilla: se marca con el acierto — "marcar las letras R A S A N T E")
  const PAL = 'RASANTE', lw = CW / 7;
  ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
  for (let i = 0; i < 7; i++) {
    const on = i < letras, bx = xs[2] + lw * i + 0.5;
    ctx.fillStyle = on ? RAS_AZUL : '#111a1f'; ctx.fillRect(bx, yB - 5, lw - 1, 10);
    ctx.strokeStyle = on ? '#bfe2ff' : SURCO; ctx.lineWidth = 0.6; ctx.strokeRect(bx + 0.3, yB - 4.7, lw - 1.6, 9.4); ctx.lineWidth = 1;
    ctx.fillStyle = on ? '#07131c' : '#3d4d56'; ctx.fillText(PAL[i], bx + (lw - 1) / 2, yB + 0.5);
  }
  nota(3, letras >= 7 ? T('demoRas3ok') : T('demoRas3n'), letras >= 7 ? RAS_AZUL : '#c9d3d7');
  ctx.restore();
}

// ---------------------------------------------------------------------------------------------
// LA BOMBA, EN GRANDE (27/11, el autor: "nunca muestra el stick que necesitas para lanzar la bomba, es con el RIGHT STICK…
// tiene que ser SUPER CLARO"): mientras explican la suelta, tres pasos en fila — 1 APUNTÁ (el stick derecho que baja y se
// queda abajo, o la ↓ mantenida), 2 SOLTÁ (el clic del stick, R3, o ENTER) y 3 CUÁNDO (el nombre del casco en amarillo).
// Es un dibujo animado con `t`; `pad` elige el mando o el teclado.
export function drawDemoBomba({ t = 0, a = 1, y0 = 34, pad = false }) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.textBaseline = 'middle';
  const CW = 78, GAP = 10, x1 = (W - (CW * 3 + GAP * 2)) / 2, xs = [x1, x1 + CW + GAP, x1 + 2 * (CW + GAP)];
  const yT = y0 + 6, yB = y0 + 22, yC = y0 + 40;
  const VERDE = '#e8a33d', ciclo = t % 3, abajo = ciclo > 0.4, clic = ciclo > 1.9 && ciclo < 2.4;
  const titulo = (k, txt, col) => { ctx.textAlign = 'left'; ctx.font = 'bold 6px monospace'; ctx.fillStyle = col; ctx.fillText(k + ' · ' + txt, xs[k - 1], yT); };
  const nota = (k, txt) => { ctx.textAlign = 'left'; ctx.font = '4.2px monospace'; ctx.fillStyle = '#c9d3d7'; String(txt).split('\n').forEach((l, i) => ctx.fillText(l, xs[k - 1], yC + i * 5.5)); };
  ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#5d6a71';
  ctx.fillText('►', xs[1] - GAP / 2, yB); ctx.fillText('►', xs[2] - GAP / 2, yB);
  // el stick derecho dibujado: aro, perilla y la flecha
  const stick = (cx, cy, dy, apretado, col) => {
    ctx.strokeStyle = '#8a969c'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = apretado ? '#ffffff' : col; ctx.beginPath(); ctx.arc(cx, cy + dy, apretado ? 4 : 5, 0, Math.PI * 2); ctx.fill();
    if (apretado) { ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy + dy, 7.5, 0, Math.PI * 2); ctx.stroke(); }
    ctx.textAlign = 'center'; ctx.font = 'bold 4.5px monospace'; ctx.fillStyle = '#c9d3d7'; ctx.fillText('R', cx, cy - 13);
  };
  const tecla = (cx, cy, txt, on, ancho = 14) => {
    ctx.fillStyle = on ? P.accent : '#1b252b'; ctx.fillRect(cx - ancho / 2, cy - 6, ancho, 12);
    ctx.strokeStyle = on ? '#ffe0a0' : '#5d6a71'; ctx.lineWidth = 0.8; ctx.strokeRect(cx - ancho / 2 + 0.4, cy - 5.6, ancho - 0.8, 11.2); ctx.lineWidth = 1;
    ctx.textAlign = 'center'; ctx.font = 'bold 6px monospace'; ctx.fillStyle = on ? '#14100a' : '#e8eef0'; ctx.fillText(txt, cx, cy + 0.5);
  };
  // 1 · APUNTÁ
  titulo(1, T('demoBomba1'), P.accent);
  if (pad) { stick(xs[0] + 14, yB, abajo ? 4.5 : 0, false, P.accent); ctx.textAlign = 'left'; ctx.font = 'bold 8px monospace'; ctx.fillStyle = P.accent; ctx.fillText('▼', xs[0] + 28, yB + 1); }
  else tecla(xs[0] + 14, yB, '↓', abajo);
  nota(1, T(pad ? 'demoBomba1p' : 'demoBomba1k'));
  // 2 · SOLTÁ
  titulo(2, T('demoBomba2'), P.accent);
  if (pad) { stick(xs[1] + 14, yB, 4.5, clic, P.accent); ctx.textAlign = 'left'; ctx.font = 'bold 6px monospace'; ctx.fillStyle = clic ? '#ffffff' : '#8a969c'; ctx.fillText(T('demoBombaClic'), xs[1] + 28, yB + 1); }
  else tecla(xs[1] + 20, yB, 'ENTER', clic, 30);
  nota(2, T(pad ? 'demoBomba2p' : 'demoBomba2k'));
  // 3 · CUÁNDO: el casco en verde
  titulo(3, T('demoBomba3'), VERDE);
  const titila = Math.sin(t * 10) > -0.2;
  ctx.textAlign = 'left'; ctx.font = 'bold 7px monospace'; ctx.fillStyle = titila ? VERDE : '#2c5a33'; ctx.fillText('HMS ———', xs[2], yB);
  nota(3, T('demoBomba3n'));
  ctx.restore();
}
