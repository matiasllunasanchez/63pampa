// HUD: la capa de instrumentos y avisos sobre el vuelo, mas la cuenta regresiva del despegue.
//
// Puntaje, best, progreso de campaña, barra de objetivo, velocidad, radar, viento, multiplicador,
// combustible, calor del canon, misiles y la palanca de gas. Va SIN el zoom de camara (el
// orquestador lo restaura antes de llamar aca).
//
// Lee el estado de vuelo de los stores (run, plane). Lo que es de MISION/menu (best, gameMode,
// curLevel, objectiveDist, objectiveShip) vive en game.js y entra por parametro, igual que las
// otras pantallas (render/screens.js, render/menus.js).

import { ctx, px, W, H, PZ } from './ctx.js';
import { plane } from '../core/state.js';
import { run } from '../core/run.js';
import { proj } from '../core/fx.js';
import { scrapeLimit } from '../core/physics.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { MISSIONS } from '../data/missions.js';
import { MSL_MAX } from '../data/tuning.js';

// barra de mision: puerto (izq) → barcaza objetivo (der). Assets configurables como data URI;
// mientras `src` este vacio se dibuja un fallback.
const OBJ_ASSETS = {
  port: { src: '', img: new Image(), ready: false },   // icono del PUERTO (extremo izquierdo)
  barge: { src: '', img: new Image(), ready: false },   // icono del OBJETIVO / barcaza (extremo derecho)
  plane: { src: '', img: new Image(), ready: false },   // AVIÓN que avanza por la línea
};
for (const k in OBJ_ASSETS) { const a = OBJ_ASSETS[k]; a.img.onload = () => { a.ready = true; }; if (a.src) a.img.src = a.src; }

function drawHudAsset(a, x, y, kind, hpx) {
  if (a.ready && a.img.naturalWidth) {
    const h = hpx, w = Math.max(1, Math.round(h * a.img.naturalWidth / a.img.naturalHeight));
    ctx.drawImage(a.img, Math.round(x - w / 2), Math.round(y - h / 2), w, h);
    return;
  }
  if (kind === 'port') { px(x - 2, y - 3, 4, 6, P.foam); px(x - 1, y - 5, 2, 2, P.dim); }
  else if (kind === 'barge') { px(x - 3, y - 2, 7, 4, P.warn); px(x - 1, y - 4, 2, 2, P.warn); }
  else { ctx.fillStyle = P.ink; ctx.beginPath(); ctx.moveTo(x + 3, y); ctx.lineTo(x - 3, y - 2.5); ctx.lineTo(x - 3, y + 2.5); ctx.closePath(); ctx.fill(); }
}

export function drawObjectiveBar(objectiveDist, objectiveShip) {
  const cx = W / 2, half = Math.round(W * 0.15);          // 30% del ancho (máx), centrada
  const x0 = cx - half, x1 = cx + half, y = 26;
  const prog = Math.max(0, Math.min(1, run.dist / objectiveDist));
  // nombre de la barcaza objetivo, centrado arriba
  ctx.font = '6px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.warn;
  ctx.fillText(objectiveShip, cx, y - 7);
  // línea: recorrido (accent) + pendiente (tenue)
  px(x0, y, x1 - x0, 1, '#2e3c45');
  px(x0, y, Math.round((x1 - x0) * prog), 1, P.accent);
  // extremos: puerto (izq) y barcaza (der) — assets configurables o fallback
  drawHudAsset(OBJ_ASSETS.port, x0, y, 'port', 8);
  drawHudAsset(OBJ_ASSETS.barge, x1, y, 'barge', 9);
  // marcador del avión avanzando por la línea (+ líneas de boost)
  const pm = x0 + (x1 - x0) * prog;
  if (run.boost) {
    ctx.strokeStyle = P.foam; ctx.globalAlpha = 0.7;
    for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(pm - 2 - i * 3, y); ctx.lineTo(pm - i * 3, y); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  drawHudAsset(OBJ_ASSETS.plane, pm, y, 'plane', 7);
}

// colores de la bandera argentina, para el conteo del despegue
const CELESTE = '#75aadb', BLANCO = '#f2f7fb';

export function drawTakeoff(toT) {
  ctx.textAlign = 'center';
  // placa oscura detras del encabezado: cae sobre el amanecer y sin esto no se lee
  ctx.fillStyle = '#0a0e11aa'; ctx.fillRect(0, 17, W, 23);
  ctx.fillStyle = P.ink; ctx.font = '7px monospace';
  ctx.fillText(T('takeoffTitle'), W / 2, 26);
  // el rumbo va pegado al titulo: antes estaba en y=80, encima del avion en la pista
  ctx.fillStyle = '#8a9ba1'; ctx.font = '6px monospace';
  ctx.fillText(T('takeoffHeading'), W / 2, 36);

  const cn = 3 - Math.floor(toT);
  if (cn >= 1) {
    const frac = toT % 1;
    const fs = Math.round(30 - frac * 10);
    const num = String(cn);
    ctx.font = 'bold ' + fs + 'px monospace';
    // sombra: el conteo cae sobre el sol del amanecer y sin esto no se lee
    ctx.fillStyle = '#0a0e11aa';
    ctx.fillText(num, W / 2 + 1, 69);
    // bandera argentina: tres franjas horizontales (celeste / blanco / celeste)
    const top = 68 - fs * 0.75, hgt = fs * 0.78;
    const bands = [[0, 1 / 3, CELESTE], [1 / 3, 2 / 3, BLANCO], [2 / 3, 1, CELESTE]];
    for (const [a, b, col] of bands) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, top + hgt * a, W, hgt * (b - a) + 0.5);   // +0.5: sin costura entre franjas
      ctx.clip();
      ctx.fillStyle = col;
      ctx.fillText(num, W / 2, 68);
      ctx.restore();
    }
  }
}

// PANEL DE ESTADO (v1 del panel de daños — roadmap #22): silueta del avion DE ESPALDAS (la misma
// vista que el sprite en vuelo, asi no hay que traducir mentalmente que parte es cual) con cada
// parte coloreada por un dato que YA EXISTE. No agrega vida ni sistemas nuevos: es lectura de un
// vistazo de como viene el avion.
//   alas  → calor del canon      (run.heat / run.overheat)
//   motor → combustible          (run.fuel)
//   panza → margen de roce       (run.scrapeT contra su limite)
// El margen de roce es el UNICO de los tres que hoy no se ve en ningun lado: al salir del roce
// `scrapeT` se descuenta lento (SCRAPE_RECOVER), asi que la panza queda "castigada" y se recupera.
function partCol(h) {
  if (h > 0.6) return P.foam;                                  // sana
  if (h > 0.3) return P.accent;                                // castigada
  return Math.sin(run.t * 10) > 0 ? P.warn : '#7d2f1e';        // critica: parpadea
}

function drawStatusPanel(x, y) {
  const cx = x + 11;
  const hWing = run.overheat ? 0 : 1 - run.heat;
  const hEngine = run.fuel / 100;
  const lim = scrapeLimit(run.spd, run.boost);
  const hBelly = lim > 0 ? 1 - Math.max(0, Math.min(1, run.scrapeT / lim)) : 1;
  ctx.fillStyle = '#00000066'; ctx.fillRect(x - 3, y - 8, 28, 26);
  ctx.fillStyle = P.dim; ctx.font = '6px monospace'; ctx.textAlign = 'left';
  ctx.fillText(T('hud_status'), x - 1, y - 2);
  px(cx - 1, y, 2, 5, P.bodyDark);              // deriva (cola) — sin dato asociado
  px(cx - 11, y + 7, 22, 3, partCol(hWing));    // ALAS  = canon (los caños van en las alas)
  px(cx - 3, y + 5, 6, 8, partCol(hEngine));    // MOTOR = combustible
  px(cx - 4, y + 13, 8, 2, partCol(hBelly));    // PANZA = roce (lo que toca el agua)
}

function bar(x, y, w, val, c, label) {
  ctx.fillStyle = '#00000066'; ctx.fillRect(x - 1, y - 1, w + 2, 5);
  px(x, y, Math.round(w * Math.max(0, Math.min(1, val))), 3, c);
  ctx.fillStyle = P.dim; ctx.font = '6px monospace'; ctx.textAlign = 'left';
  ctx.fillText(label, x, y - 3);
}

export function drawHUD(h) {
      const { best, gameMode, curLevel, objectiveDist, objectiveShip } = h;
  ctx.font = '8px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = P.ink;
  const digits = String(Math.floor(run.score)).padStart(6, '0');
  for (let i = 0; i < digits.length; i++) ctx.fillText(digits[i], 6 + i * 6, 12);
  ctx.textAlign = 'right'; ctx.fillStyle = P.dim;
  ctx.fillText(T('hud_best', { n: best }), W - 16, 12);   // corrido a la izq para no chocar el ícono de sonido

  // modo campaña: PROGRESO de la campaña arriba al centro. No repite el nombre del blanco —
  // de eso ya se ocupa la barra de objetivo, justo abajo.
  if (gameMode === 'campaign') {
    ctx.textAlign = 'center'; ctx.font = 'bold 8px monospace'; ctx.fillStyle = P.accent;
    ctx.fillText(T('hud_mission', { n: curLevel + 1, m: MISSIONS.length }), W / 2, 12);
  }

  // barra de misión puerto→barcaza (modos con objetivo: ciclo de muerte y campaña)
  if (objectiveDist > 0) drawObjectiveBar(objectiveDist, objectiveShip);

  // velocidad (+ escalón de TURBINA cuando el afterburner sostenido está activo)
  ctx.textAlign = 'center'; ctx.font = '7px monospace';
  ctx.fillStyle = run.afterTier > 0 ? P.warn : run.boost || run.rasLevel > 0 ? P.accent : run.windF < 0.97 ? P.crest : P.dim;
  ctx.fillText(Math.round(run.spd * 4.2) + T('kmh') + (run.afterTier > 0 ? ' »' + run.afterTier : run.boost ? T('turboTag') : run.windF < 0.97 ? ' ▼' : ''), W / 2, H - 4);

  // --- avisos de la banda superior (radar y viento) ---
  // Todos los overlays de arriba van centrados en W/2, asi que se pisaban entre si.
  // Ahora arrancan DEBAJO de la barra de objetivo cuando esta existe (ocupa y=14..30);
  // si no hay mision, suben y quedan compactos. Cada aviso tiene su propia fila.
  const topBase = objectiveDist > 0 ? 38 : 20;

  if (run.detection > 0.3) {
    ctx.textAlign = 'center'; ctx.font = 'bold 8px monospace';
    ctx.fillStyle = Math.sin(run.t * 14) > 0 ? P.warn : '#7d2f1e';
    ctx.fillText(T('radar'), W / 2, topBase);
    ctx.fillStyle = '#00000066'; ctx.fillRect(W / 2 - 21, topBase + 3, 42, 4);
    px(W / 2 - 20, topBase + 4, Math.round(40 * run.detection), 2, P.warn);
  }

  // aviso de viento en contra — una fila mas abajo, nunca encima del radar
  if (run.windF < 0.97) {
    ctx.textAlign = 'center'; ctx.font = 'bold 7px monospace';
    ctx.fillStyle = Math.sin(run.t * 8) > 0 ? P.crest : P.dim;
    ctx.fillText(T('windWarn'), W / 2, topBase + 16);
  }

  // multiplicador junto al avión — crece con la racha rasante
  if (run.multShow > 1) {
    const s = proj(plane.x, plane.y, PZ);
    ctx.textAlign = 'left';
    const size = run.multShow >= 15 ? 12 + run.rasLevel : run.multShow >= 10 ? 11 : run.multShow >= 5 ? 10 : 9;
    ctx.font = 'bold ' + size + 'px monospace';
    ctx.fillStyle = run.multShow >= 25 ? (Math.sin(run.t * 16) > 0 ? P.warn : P.accent)
      : run.multShow >= 15 ? P.accent
        : run.multShow >= 10 ? P.accent
          : run.multShow >= 5 ? '#d9b06a' : P.dim;
    const jx = run.rasLevel > 0 ? (Math.random() - 0.5) * run.rasLevel : 0;
    const jy = run.rasLevel > 0 ? (Math.random() - 0.5) * run.rasLevel : 0;
    if (run.multShow < 10 || Math.sin(run.t * 10) > -0.6)
      ctx.fillText('x' + run.multShow + (run.boost ? ' x2' : ''), s.x + 24 + jx, s.y - 6 + jy);
    // barra de progreso hacia el próximo nivel de racha
    if (run.mult === 10 && run.rasLevel < 4) {
      const prog = (run.streak % 2) / 2;
      ctx.fillStyle = '#00000066'; ctx.fillRect(s.x + 24, s.y - 3, 26, 3);
      px(s.x + 25, s.y - 2, Math.round(24 * prog), 1, P.accent);
    }
  }
  // borde encendido según la racha
  if (run.rasLevel > 0) {
    ctx.globalAlpha = 0.05 * run.rasLevel + Math.max(0, Math.sin(run.t * 6)) * 0.04 * run.rasLevel;
    px(0, 0, W, 3, P.accent); px(0, H - 3, W, 3, P.accent);
    px(0, 0, 3, H, P.accent); px(W - 3, 0, 3, H, P.accent);
    ctx.globalAlpha = 1;
  }

  // panel de estado del avion — abajo a la derecha, en la misma columna que el gas y el canon:
  // queda debajo de la palanca (termina en y=119) y arriba del rotulo del canon (y=169)
  drawStatusPanel(287, 140);

  bar(6, H - 8, 60, run.fuel / 100, run.fuel < 25 ? (Math.sin(run.t * 10) > 0 ? P.warn : P.dim) : P.foam, T('bar_fuel'));
  bar(W - 66, H - 8, 60, run.heat, run.overheat ? P.warn : P.accent, run.overheat ? T('bar_overheat') : T('bar_cannon'));

  // munición de misiles (pips) — entre combustible y el centro
  ctx.textAlign = 'left'; ctx.font = '6px monospace'; ctx.fillStyle = P.dim;
  ctx.fillText('MISIL', 72, H - 11);
  for (let i = 0; i < MSL_MAX; i++) {
    const on = i < run.msl, bx = 72 + i * 8;
    ctx.fillStyle = on ? P.accent : '#2e3c45'; ctx.fillRect(bx, H - 8, 5, 3);
    if (on) { ctx.fillStyle = P.warn; ctx.fillRect(bx + 5, H - 8, 1, 3); }
  }

  // palanca de gas (throttle) — vertical, borde derecho
  const tx = W - 9, tyTop = 46, tyBot = 118, tH = tyBot - tyTop;
  ctx.fillStyle = '#00000088'; ctx.fillRect(tx - 1, tyTop - 1, 6, tH + 2);
  ctx.fillStyle = P.dim;                                     // marcas de la corredera
  for (let i = 0; i <= 4; i++) ctx.fillRect(tx - 3, Math.round(tyBot - tH * (i / 4)), 2, 1);
  const fillH = Math.round(tH * Math.max(0, Math.min(1, run.throttle)));
  const tcol = run.fuel <= 0 ? (Math.sin(run.t * 10) > 0 ? P.warn : P.dim)
    : run.throttle > 0.66 ? P.foam : run.throttle > 0.15 ? P.accent : P.bodyDark;
  px(tx, tyBot - fillH, 4, fillH, tcol);                     // relleno desde abajo
  px(tx - 2, tyBot - fillH - 1, 8, 2, P.ink);                  // perilla de la palanca
  ctx.fillStyle = P.dim; ctx.font = '6px monospace'; ctx.textAlign = 'right';
  ctx.fillText(run.fuel <= 0 ? T('thr_dead') : T('thr'), W - 4, tyTop - 4);
}

