// RENDER del ARENA: la capa 2D que va ENCIMA del mundo 3D (systems/three-arena.js).
//
// Todo en espacio de PANTALLA (grilla 480x270). El mundo lo pone three con la camara ya puesta
// donde esta el avion, asi que aca no hay transform que deshacer: lo que hace falta del mundo
// (donde cae una zona, donde cae el buque) se PREGUNTA por frame con project()/zoneRect3D().
//
// En un espacio abierto la legibilidad es requisito, no adorno: sin la flecha al buque y el
// altimetro, a los tres segundos no sabes donde estas.
import { ctx, W, H, px, HOR } from './ctx.js';
import { P } from '../data/palette.js';
import { T } from '../core/i18n.js';
import { run } from '../core/run.js';
import { cfg } from '../core/state.js';
import { drawMira } from './miras.js';
import { MSL_MAX } from '../data/tuning.js';
import { PLANES, SHEET_FW, SHEET_FH, SHEET_NF } from '../data/planes.js';
import { PITCH_ROW } from '../core/physics.js';
import { drawCockpit } from './momentum.js';
import * as world3D from '../systems/three-arena.js';

// Cuanto BAJA el PNG de la cabina en 1a persona. El visor pintado del asset esta arriba (el ARENA
// VIEJO le clavaba la mira en MOM_AY=60), pero aca la mira NO es fija: cae donde apunta el morro,
// que en 1a persona es el centro de pantalla (H/2 = 135). Bajar el PNG es lo que hace coincidir
// el visor pintado con la mira real. Si se cambia el asset de cabina, re-medir.
const COCKPIT_Y = 74;

/** El avion en TERCERA persona: el sprite de vuelo (vista trasera) con el alabeo y el cabeceo
 *  reales de la maniobra. La camara va detras, asi que el avion siempre se ve de atras — que es
 *  justo la vista para la que estan horneadas las hojas. */
function drawThirdPlane(A, selPlane) {
  const pl = PLANES[selPlane];
  if (!pl.sheetOk) return;
  const bank = Math.max(-1, Math.min(1, A.roll));
  const col = Math.round((1 - bank) / 2 * (SHEET_NF - 1));
  const row = A.pitch > PITCH_ROW ? 0 : A.pitch < -PITCH_ROW ? 2 : 1;
  const spW = 84, spH = 84;
  // el avion se dibuja DONDE ESTA (proyectando su posicion real), no clavado a un punto fijo de
  // la pantalla: la camara lo sigue con resorte, asi que al maniobrar el avion se DESPLAZA dentro
  // del cuadro y recien despues la camara lo recentra. Clavado, todo el mundo giraba alrededor de
  // un sprite inmovil y el vuelo se sentia rigido.
  const p = world3D.project(A.pos.x, A.pos.y, A.pos.z);
  if (!p.vis) return;
  const bx = p.x + Math.sin(A.t * 1.6) * 1.5;
  const by = p.y + Math.sin(A.t * 2.3) * 1.5;
  ctx.drawImage(pl.sheetImg, col * SHEET_FW, row * SHEET_FH, SHEET_FW, SHEET_FH,
    Math.round(bx - spW / 2), Math.round(by - spH / 2), spW, spH);
}

/** Flecha al borde de pantalla apuntando al buque cuando quedo fuera de cuadro. */
function shipArrow(sp) {
  const cx = W / 2, cy = H / 2;
  let dx = sp.x - cx, dy = sp.y - cy;
  if (!sp.vis) { dx = -dx; dy = -dy; }                  // detras: el rumbo real es el opuesto
  const d = Math.hypot(dx, dy) || 1;
  const R = 74;
  const ax = cx + dx / d * R, ay = cy + dy / d * R;
  const a = Math.atan2(dy, dx);
  ctx.save();
  ctx.translate(ax, ay); ctx.rotate(a);
  ctx.fillStyle = P.warn; ctx.globalAlpha = 0.9;
  ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-4, -4); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawArena(w) {
  const { arena: A, zones, objectiveShip, parts, popups, selPlane } = w;

  // ---- zonas: corchetes + etiqueta + HP (vivas); humo (muertas) ----
  for (const z of zones) {
    const r = world3D.zoneRect3D(z.id);
    if (!r || r.w > W * 1.6) continue;                  // del lado ciego, fuera de cuadro o encima
    if (z.hp <= 0) {
      if (Math.random() < 0.25) parts.push({
        x: r.x + Math.random() * r.w, y: r.y, vx: (Math.random() - 0.5) * 8,
        vy: -(10 + Math.random() * 12), life: 0.8, c: '#3a3f43', r: 1.5,
      });
      continue;
    }
    const blink = Math.sin(A.t * 7) > -0.4;
    if (blink) {
      ctx.strokeStyle = P.warn; ctx.lineWidth = 1; ctx.globalAlpha = 0.9;
      const c = Math.max(2, Math.min(r.w, r.h) * 0.28);
      ctx.beginPath();
      ctx.moveTo(r.x, r.y + c); ctx.lineTo(r.x, r.y); ctx.lineTo(r.x + c, r.y);
      ctx.moveTo(r.x + r.w - c, r.y); ctx.lineTo(r.x + r.w, r.y); ctx.lineTo(r.x + r.w, r.y + c);
      ctx.moveTo(r.x, r.y + r.h - c); ctx.lineTo(r.x, r.y + r.h); ctx.lineTo(r.x + c, r.y + r.h);
      ctx.moveTo(r.x + r.w - c, r.y + r.h); ctx.lineTo(r.x + r.w, r.y + r.h); ctx.lineTo(r.x + r.w, r.y + r.h - c);
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    ctx.font = '6px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.warn;
    ctx.fillText(T(z.label), r.x + r.w / 2, r.y - 3);
    const bw = Math.min(r.w, 40), bx0 = r.x + (r.w - bw) / 2;
    px(bx0, r.y + r.h + 2, bw, 2, '#2e3c45');
    px(bx0, r.y + r.h + 2, bw * (z.hp / z.maxHp), 2, P.warn);
  }

  // ---- proyectiles propios: del ala al punto apuntado, en el MUNDO ----
  for (const f of A.fx) {
    if (f.k === 'sh' || f.k === 'ms') {
      const t = Math.min(1, f.T / f.dur);
      const ap = world3D.project(f.aim.x, f.aim.y, f.aim.z);
      const ox = W / 2 + f.side * (f.k === 'ms' ? 26 : 20), oy = H * 0.60;
      const fx2 = ox + (ap.x - ox) * t, fy2 = oy + (ap.y - oy) * t;
      if (t < 1) {
        const dl = Math.hypot(ap.x - ox, ap.y - oy) || 1;
        const ux = (ap.x - ox) / dl, uy = (ap.y - oy) / dl;
        const L = f.k === 'ms' ? 9 : 13;
        ctx.globalAlpha = 0.35; ctx.strokeStyle = P.warn; ctx.lineWidth = f.k === 'ms' ? 3 : 2;
        ctx.beginPath(); ctx.moveTo(fx2 - ux * L * 1.6, fy2 - uy * L * 1.6); ctx.lineTo(fx2, fy2); ctx.stroke();
        ctx.globalAlpha = 0.95; ctx.strokeStyle = P.accent; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(fx2 - ux * L * 0.7, fy2 - uy * L * 0.7); ctx.lineTo(fx2, fy2); ctx.stroke();
        ctx.lineWidth = 1; ctx.globalAlpha = 1;
        if (f.k === 'ms') px(fx2 - 1, fy2 - 1, 3, 3, P.foam);
      } else {
        ctx.globalAlpha = Math.min(1, f.life * 2.5);
        px(ap.x - 2, ap.y - 2, 4, 4, f.zone ? P.accent : P.foam);
        ctx.globalAlpha = 1;
      }
    } else if (f.k === 'tr3') {
      // trazadora enemiga: un punto del MUNDO — se proyecta la cabeza y una cola corta
      const hp2 = world3D.project(f.x, f.y, f.z);
      if (!hp2.vis) continue;
      const tp = world3D.project(f.x - f.vx * 0.06, f.y - f.vy * 0.06, f.z - f.vz * 0.06);
      const a = Math.min(1, f.life);
      ctx.globalAlpha = a * 0.5; ctx.strokeStyle = P.warn;
      ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.lineTo(hp2.x, hp2.y); ctx.stroke();
      ctx.globalAlpha = a;
      px(hp2.x - 1, hp2.y - 1, 2, 2, P.accent);
      ctx.globalAlpha = 1;
    } else if (f.k === 'fw3') {
      // AVISO de flak: anillo que se CIERRA sobre el punto de detonacion, en el mundo.
      // Si el punto quedo detras de la camara no se dibuja — y esta bien: un flak que dejaste
      // atras ya no te puede agarrar quieto.
      const wp = world3D.project(f.px, f.py, f.pz);
      if (!wp.vis) continue;
      const p = 1 - Math.max(0, f.fuse) / 1.15;
      const r2 = 26 - p * 19;
      const hot = f.fuse < 0.35 && Math.sin(f.T * 40) > 0;
      ctx.strokeStyle = hot ? '#ff5340' : P.warn; ctx.globalAlpha = 0.5 + p * 0.45;
      ctx.beginPath(); ctx.arc(wp.x, wp.y, r2, 0, 7); ctx.stroke();
      px(wp.x - 1, wp.y - 1, 2, 2, hot ? '#ff5340' : P.warn);
      ctx.globalAlpha = 1;
    } else if (f.k === 'fk3') {
      // detonacion de flak en el mundo: fogonazo → bocanada de humo
      const wp = world3D.project(f.px, f.py, f.pz);
      if (!wp.vis) continue;
      const a = Math.min(1, f.life), r2 = 3 + f.vr * f.T;
      ctx.globalAlpha = a * (f.T < 0.12 ? 0.95 : 0.5);
      ctx.fillStyle = f.T < 0.12 ? P.warn : '#7c838a';
      ctx.beginPath(); ctx.arc(wp.x, wp.y, r2, 0, 7); ctx.fill();
      if (f.T >= 0.12) { ctx.fillStyle = '#565c63'; ctx.beginPath(); ctx.arc(wp.x - r2 * 0.3, wp.y + r2 * 0.2, r2 * 0.55, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
    } else {                                             // 'fk': fogonazo → humo (pantalla)
      const a = Math.min(1, f.life), r2 = 2 + f.vr * f.T;
      ctx.globalAlpha = a * (f.T < 0.12 ? 0.95 : 0.45);
      ctx.fillStyle = f.T < 0.12 ? P.warn : '#7c838a';
      ctx.beginPath(); ctx.arc(f.x, f.y, r2, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // particulas y popups
  for (const p of parts) { ctx.globalAlpha = Math.min(1, p.life * 2); px(p.x, p.y, p.r, p.r, p.c); }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  for (const p of popups) {
    ctx.font = p.big ? 'bold 10px monospace' : '7px monospace';
    ctx.globalAlpha = Math.min(1, p.life); ctx.fillStyle = p.c; ctx.fillText(p.txt, p.x, p.y);
  }
  ctx.globalAlpha = 1;

  // ---- el avion: cabina (1a) o sprite (3a) ----
  if (w.view === 1) {
    drawCockpit({ mom: { t: A.t, hitFx: A.hitFx }, t: w.t, yOff: COCKPIT_Y });
    if (A.flashL > 0) { ctx.globalAlpha = Math.min(1, A.flashL * 9); px(0, 56, 9, 15, '#ffffff'); ctx.globalAlpha = 1; }
    if (A.flashR > 0) { ctx.globalAlpha = Math.min(1, A.flashR * 9); px(W - 9, 56, 9, 15, '#ffffff'); ctx.globalAlpha = 1; }
  } else drawThirdPlane(A, selPlane);

  // ---- MIRA: proyectada desde el MUNDO, sobre el punto adonde de verdad va el tiro (un
  // punto lejano a lo largo del morro). En 1a cae al centro por construccion; en 3a corrige
  // sola el paralaje de la camara — una mira fija en pantalla mentia unos grados.
  const app = world3D.project(A.pos.x + A.fwd.x * 400, A.pos.y + A.fwd.y * 400, A.pos.z + A.fwd.z * 400);
  const ax = app.vis ? app.x : W / 2, ay = app.vis ? app.y : H / 2;
  // la MIRA elegida en el menu [M] (cfg.mira, 1..9) — la misma del PASILLO. Si la hoja no cargo
  // todavia, cae al reticulo vectorial de siempre.
  if (!drawMira(cfg.mira, ax, ay, 16, A.hitFx ? 1 : 0.85)) {
    const mc = A.hitFx ? P.accent : P.ink;
    ctx.strokeStyle = mc; ctx.globalAlpha = 0.9;
    ctx.strokeRect(ax - 5, ay - 5, 10, 10);
    ctx.globalAlpha = 1;
    px(ax - 7, ay, 3, 1, mc); px(ax + 5, ay, 3, 1, mc);
    px(ax, ay - 7, 1, 3, mc); px(ax, ay + 5, 1, 3, mc);
  }

  // ---- flecha al buque si quedo fuera de cuadro ----
  const sp = world3D.project(0, 20, 0);
  if (!sp.vis || sp.x < 8 || sp.x > W - 8 || sp.y < 16 || sp.y > H - 16) shipArrow(sp);

  // ---- letterbox + tablero ----
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, 13); ctx.fillRect(0, H - 13, W, 13);
  ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.warn;
  ctx.fillText(T('mom_title') + '  ·  ' + objectiveShip, W / 2, 9);

  // altura y velocidad: la referencia basica de un vuelo libre
  ctx.font = '6px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = P.dim;
  ctx.fillText('ALT ' + (A.pos.y | 0) + ' m', 6, H - 4);
  ctx.fillText('VEL ' + ((A.spd * 3.6) | 0) + ' km/h', 66, H - 4);

  // zonas como casillas (progreso del asalto, sin reloj) + misiles + escuadron
  const zw = zones.length * 7;
  for (let i = 0; i < zones.length; i++)
    px(W / 2 - zw / 2 + i * 7, H - 9, 5, 3, zones[i].hp <= 0 ? P.warn : '#2e3c45');
  ctx.textAlign = 'right'; ctx.fillStyle = P.dim;
  ctx.fillText('Z', W / 2 - zw / 2 - 28, H - 4);
  for (let i = 0; i < MSL_MAX; i++)
    px(W / 2 - zw / 2 - 24 + i * 6, H - 9, 4, 3, i < run.msl ? P.accent : '#2e3c45');
  if (run.squad > 1) {
    ctx.textAlign = 'left'; ctx.fillText(T('arena_squad'), W / 2 + zw / 2 + 8, H - 4);
    for (let i = 0; i < run.squad; i++)
      px(W / 2 + zw / 2 + 34 + i * 6, H - 9, 4, 3, i < run.lives ? P.accent : '#2e3c45');
  }

  // ---- RING: aviso y piloto automatico ----
  ctx.textAlign = 'center';
  if (A.auto) {
    ctx.font = 'bold 8px monospace'; ctx.fillStyle = P.warn;
    ctx.fillText(T('arena_auto'), W / 2, 30);
  } else if (A.outT > 0) {
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = Math.sin(A.t * 14) > 0 ? P.warn : P.dim;
    ctx.fillText(T('arena_out'), W / 2, 30);
  }
  if (A.doneT <= 0 && A.t < 4) {
    ctx.font = '6px monospace'; ctx.fillStyle = P.dim;
    ctx.fillText(T('arena_hint'), W / 2, 21);
  }
}
