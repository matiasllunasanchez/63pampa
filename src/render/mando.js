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

const CUERPO = '#2b3337', BORDE = '#7f9099', BOTON = '#c9d1d5', TINTA = '#1c2226', RAYA = '#8aa0ab';

// LOS BOTONES DEL JOYSTICK (posicion en la lamina) → las acciones que cuelgan de el. `lado`: de que margen sale el rotulo
const PAD = [
  { id: 'L2', x: 110, y: 54, t: 'L2', ac: ['Gas'], lado: -1 },
  { id: 'L1', x: 110, y: 63, t: 'L1', ac: ['Msl'], lado: -1 },
  { id: 'R2', x: 210, y: 54, t: 'R2', ac: ['Boost'], lado: 1 },
  { id: 'R1', x: 210, y: 63, t: 'R1', ac: ['Gun'], lado: 1 },
  { id: 'LS', x: 128, y: 92, stick: 'L', ac: ['Fly', 'Gas', 'Dive'], lado: -1 },
  { id: 'DP', x: 128, y: 74, cruceta: true, ac: ['Secund', 'Chancha', 'Cam'], lado: -1 },
  { id: 'RS', x: 180, y: 106, stick: 'R', ac: ['Roll', 'MiraB', 'TiraB'], lado: 1 },
  { id: 'TRI', x: 198, y: 70, t: '△', ac: ['Tempo'], lado: 1 },
  { id: 'CIR', x: 207, y: 78, t: '◯', ac: ['Chapitas'], lado: 1 },
  { id: 'CRU', x: 198, y: 86, t: '✕', ac: ['Gun'], lado: 1, sinRotulo: true },
  { id: 'CUA', x: 189, y: 78, t: '□', ac: ['Radar'], lado: 1 },
  { id: 'ST', x: 172, y: 72, t: 'START', ac: ['Pause'], lado: 1, chico: true },
];
// LOS RENGLONES DE CADA LADO (y de cada rotulo), en orden de arriba abajo: se reparten parejos para que no se pisen
const FILAS_IZQ = ['L2', 'L1', 'DP', 'LS'], FILAS_DER = ['R2', 'R1', 'TRI', 'CIR', 'CUA', 'ST', 'RS'];

// EL TECLADO: las teclas que importan, en su lugar aproximado de un teclado comun (columna, fila), y su accion
const TECLAS = [
  { t: 'ESC', c: 0, f: 0, ac: 'Pause' }, { t: '1', c: 1, f: 1, ac: 'Secund' }, { t: '4', c: 4, f: 1, ac: 'Tempo' },
  { t: 'Q', c: 1, f: 2, ac: 'Roll' }, { t: 'W', c: 2, f: 2, ac: 'Gas' }, { t: 'E', c: 3, f: 2, ac: 'Roll' },
  { t: 'R', c: 4, f: 2, ac: 'Pan' }, { t: 'Y', c: 6, f: 2, ac: 'Radar' },
  { t: 'A', c: 1.3, f: 3, ac: 'Fly' }, { t: 'S', c: 2.3, f: 3, ac: 'Dive' }, { t: 'D', c: 3.3, f: 3, ac: 'Fly' },
  { t: 'F', c: 4.3, f: 3, ac: 'MiraB' }, { t: 'H', c: 6.3, f: 3, ac: 'Chapitas' }, { t: 'J', c: 7.3, f: 3, ac: 'Chancha' },
  { t: 'SHIFT', c: 0, f: 4, w: 1.8, ac: 'Boost' }, { t: 'Z', c: 1.8, f: 4, ac: 'Msl' }, { t: 'X', c: 2.8, f: 4, ac: 'Gun' },
  { t: 'C', c: 3.8, f: 4, ac: 'Boost' }, { t: 'V', c: 4.8, f: 4, ac: 'Cam' },
  { t: 'ESPACIO', c: 3, f: 5, w: 5, ac: 'TiraB' },
];
// el color de cada familia de accion (vuelo, armas, el resto), igual en el teclado y en su leyenda
const FAMILIA = { Fly: 0, Gas: 0, Dive: 0, Roll: 0, Pan: 0, Boost: 0, Gun: 1, Msl: 1, MiraB: 1, TiraB: 1, Secund: 1, Chapitas: 1 };
const COLORES = ['#e8a33d', '#ff6a5a', '#6fe3ff'];
const colorDe = ac => COLORES[FAMILIA[ac] ?? 2];

function redondo(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

/** La lamina entera. `pad` = joystick (si no, teclado); `t` = reloj (s) para el latido; `a` = alfa de entrada (0..1). */
export function drawMando({ pad, t = 0, a = 1 }) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.textBaseline = 'middle';
  // el titulo
  ctx.textAlign = 'center'; ctx.font = 'bold 7px monospace'; ctx.fillStyle = P.accent;
  ctx.fillText(T(pad ? 'mandoTituloPad' : 'mandoTituloKb'), W / 2, 24);
  ctx.font = '4px monospace'; ctx.fillStyle = P.dim;
  ctx.fillText(T('mandoNota'), W / 2, 31);
  if (pad) dibujarPad(t); else dibujarTeclado(t);
  ctx.restore();
}

function dibujarPad(t) {
  // EL CUERPO: un joystick de dos manijas
  ctx.fillStyle = CUERPO; ctx.strokeStyle = BORDE; ctx.lineWidth = 0.8;
  redondo(112, 60, 96, 40, 12); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(120, 98, 14, 20, 0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(200, 98, 14, 20, -0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  redondo(113, 61, 94, 38, 11); ctx.fill();
  // los hombros
  for (const b of PAD) {
    if (/^[LR][12]$/.test(b.id)) {
      ctx.fillStyle = CUERPO; redondo(b.x - 8, b.y - 3, 16, 6, 2.5); ctx.fill(); ctx.stroke();
      etiqueta(b.t, b.x, b.y, 4);
    }
  }
  for (const b of PAD) {
    if (b.stick) {
      ctx.fillStyle = '#1c2226'; ctx.beginPath(); ctx.arc(b.x, b.y, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      const k = Math.sin(t * 2.2 + (b.stick === 'R' ? 1.5 : 0)) * 2;
      ctx.fillStyle = BOTON; ctx.beginPath(); ctx.arc(b.x + k, b.y, 4.2, 0, Math.PI * 2); ctx.fill();
      etiqueta(b.stick, b.x + k, b.y, 4);
    } else if (b.cruceta) {
      ctx.fillStyle = '#1c2226'; ctx.fillRect(b.x - 2, b.y - 6, 4, 12); ctx.fillRect(b.x - 6, b.y - 2, 12, 4);
      ctx.fillStyle = P.accent; ctx.fillRect(b.x - 2, b.y - 6, 4, 4);
    } else if (!/^[LR][12]$/.test(b.id)) {
      if (b.chico) { ctx.fillStyle = '#1c2226'; redondo(b.x - 6, b.y - 2, 12, 4, 2); ctx.fill(); etiqueta(b.t, b.x, b.y, 2.6, '#e8eef0'); }
      else { ctx.fillStyle = '#1c2226'; ctx.beginPath(); ctx.arc(b.x, b.y, 3.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); etiqueta(b.t, b.x, b.y + 0.2, 4, '#e8eef0'); }
    }
  }
  // LOS ROTULOS: cada lado, en renglones parejos; una raya del boton al renglon
  rotulos(FILAS_IZQ, -1, t);
  rotulos(FILAS_DER, 1, t);
}

function rotulos(ids, lado, t) {
  const y0 = 40, paso = lado < 0 ? 20 : 11, xr = lado < 0 ? 84 : 236;
  ids.forEach((id, i) => {
    const b = PAD.find(p => p.id === id);
    if (!b || b.sinRotulo) return;
    const y = y0 + i * paso;
    ctx.strokeStyle = RAYA; ctx.lineWidth = 0.4; ctx.globalAlpha *= 1;
    ctx.beginPath(); ctx.moveTo(b.x + (lado < 0 ? -4 : 4), b.y); ctx.lineTo(xr + (lado < 0 ? 2 : -2), y); ctx.stroke();
    ctx.textAlign = lado < 0 ? 'right' : 'left';
    const lineas = b.ac.map(ac => T('ctrl' + ac));
    if (b.id === 'RS') lineas.push(T('mandoR3'));
    lineas.forEach((txt, k) => {
      ctx.font = (k ? '' : 'bold ') + '4.5px monospace';
      ctx.fillStyle = colorDe(b.ac[Math.min(k, b.ac.length - 1)]);
      ctx.fillText(txt, xr, y + k * 5.5);
    });
  });
}

function etiqueta(txt, x, y, px, col = TINTA) {
  ctx.textAlign = 'center'; ctx.font = `bold ${px}px monospace`; ctx.fillStyle = col; ctx.fillText(txt, x, y);
}

function dibujarTeclado(t) {
  const K = 12, x0 = 22, y0 = 42;
  // el fondo del teclado
  ctx.fillStyle = '#151b1f'; ctx.strokeStyle = BORDE; ctx.lineWidth = 0.6;
  redondo(x0 - 4, y0 - 4, K * 9 + 8, K * 6 + 8, 3); ctx.fill(); ctx.stroke();
  const vistos = new Set();
  for (const k of TECLAS) {
    const x = x0 + k.c * K, y = y0 + k.f * K, w = (k.w || 1) * K - 2, col = colorDe(k.ac);
    ctx.fillStyle = '#5b666c'; redondo(x, y + 1, w, K - 3, 1.6); ctx.fill();
    ctx.fillStyle = '#d9dfe2'; redondo(x, y, w, K - 4, 1.6); ctx.fill();
    ctx.fillStyle = col; ctx.fillRect(x + 1, y + K - 6, w - 2, 1.2);   // la raya de su familia
    ctx.textAlign = 'center'; ctx.font = `bold ${k.t.length > 2 ? 3.6 : 5}px monospace`; ctx.fillStyle = TINTA;
    ctx.fillText(k.t, x + w / 2, y + (K - 4) / 2);
    vistos.add(k.ac);
  }
  // LA LEYENDA, a la derecha: cada accion con sus teclas (la misma tabla de CONTROLES)
  const xl = x0 + K * 9 + 8;
  ctx.textAlign = 'left';
  // (en dos columnas: en una sola, la lista bajaba hasta la caja del dialogo)
  [...vistos].forEach((ac, i) => {
    const x = xl + (i >= 9 ? 66 : 0), y = y0 - 4 + (i % 9) * 9;
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
export function drawDemoRasante({ t = 0, a = 1, oy = 0 }) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(0, oy);
  ctx.textBaseline = 'middle';
  const BW = 120, x = (W - BW) / 2;
  // 1 · PERFECTO, cargando (4 s)
  ctx.textAlign = 'center'; ctx.font = 'bold 9px monospace'; ctx.fillStyle = P.accent;
  ctx.fillText(T('mult_perfect'), W / 2, 30);
  const carga = (t % 4) / 4;
  ctx.fillStyle = SURCO; ctx.fillRect(x, 38, BW, 3);
  ctx.fillStyle = P.accent; ctx.fillRect(x, 38, Math.round(BW * carga), 3);
  ctx.font = '4.5px monospace'; ctx.fillStyle = '#e8eef0';
  ctx.fillText(T('demoRasPerf'), W / 2, 47);
  // 2 · RASANTE: el pulso
  ctx.font = 'bold 9px monospace'; ctx.fillStyle = RAS_AZUL;
  ctx.fillText(T('mult_rasante'), W / 2, 62);
  const y = 70, sec0 = 0.55, secW = 0.3;
  ctx.fillStyle = SURCO; ctx.fillRect(x, y, BW, 10);
  ctx.fillStyle = RAS_AZUL; ctx.fillRect(x + BW * sec0, y, BW * secW, 10);
  // la aguja va y viene (una vuelta por segundo y medio, como en el juego pero mas lenta para leerla)
  const f = (t * 0.6) % 1, pos = f < 0.5 ? f * 2 : 2 - f * 2;
  const enAzul = pos >= sec0 && pos <= sec0 + secW;
  ctx.fillStyle = enAzul ? '#ffffff' : '#e9edf0'; ctx.fillRect(x + Math.round(pos * (BW - 2)), y - 3, 2, 16);
  // el reloj de la ventana, abajo, vaciandose
  const ven = 1 - ((t * 0.25) % 1);
  ctx.fillStyle = SURCO; ctx.fillRect(x, y + 14, BW, 3);
  ctx.fillStyle = P.accent; ctx.fillRect(x, y + 14, Math.round(BW * ven), 3);
  // los rotulos
  ctx.font = '4.5px monospace';
  ctx.textAlign = 'left'; ctx.fillStyle = RAS_AZUL;
  ctx.fillText('◄ ' + T('demoRasAzul'), x + BW + 4, y + 5);
  ctx.textAlign = 'right'; ctx.fillStyle = '#e8eef0';
  ctx.fillText(T('demoRasAguja') + ' ►', x - 4, y + 5);
  ctx.textAlign = 'left'; ctx.fillStyle = P.accent;
  ctx.fillText('◄ ' + T('demoRasReloj'), x + BW + 4, y + 15.5);
  // EL GAS: cuando la aguja pasa por el azul, se "aprieta" (el destello que dice cuando)
  ctx.textAlign = 'center'; ctx.font = 'bold 6px monospace';
  ctx.fillStyle = enAzul ? '#ffffff' : '#5d6a71';
  ctx.fillText(enAzul ? T('demoRasAhora') : T('demoRasEspera'), W / 2, y + 26);
  ctx.restore();
}
