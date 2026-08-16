// RENDER de la fase PASADA: la capa 2D que va ENCIMA del mundo 3D (systems/three-arena.js, la
// MISMA escena que usa el arena). Todo en espacio de PANTALLA (grilla 480x270).
//
// Lo que se puede compartir con el arena se IMPORTA, no se copia (SPEC_MODO_PASADA §3): el avion en
// 3a persona, la flecha al buque, la cabina y la mira son los mismos. Lo que NO se comparte son los
// indicadores de sistemas que la pasada no tiene (pintado de misiles, stagger, reparto de energia):
// dibujar barras de algo que no existe seria mentirle al jugador.
//
// ESTA ES LA FASE P0: tablero minimo. La banda de armado en el HUD, los corchetes calientes de la
// ventana y los avisos por capa llegan en P5 (legibilidad), que es su fase.
import { ctx, W, H, px } from './ctx.js';
import { P } from '../data/palette.js';
import { T } from '../core/i18n.js';
import { run } from '../core/run.js';
import { cfg } from '../core/state.js';
import { drawMira } from './miras.js';
import { drawCockpit } from './momentum.js';
import { drawThirdPlane, shipArrow, COCKPIT_Y } from './arena.js';
import * as world3D from '../systems/three-arena.js';
import { PS } from '../data/pasada.js';
import { shown as dmgShown } from '../systems/damage.js';

export function drawPasada(w) {
  const { pasada: A, zones, objectiveShip, parts, popups, selPlane } = w;

  // ---- zonas: corchetes + etiqueta + HP (vivas); humo (muertas) ----
  // Version simple a proposito: sin arco de pintado ni barra de stagger, que son sistemas del
  // arena. Acá el blanco no se "marca": se le pasa por encima.
  //
  // SOLO DESDE LA VENTANA (POPUP_DIST_M). Es RF-05 —el salto es lo que habilita la mira sobre las
  // zonas— y ademas resuelve lo que se ve a 1200 m: cinco etiquetas apiladas sobre un buque que
  // mide diez pixeles. De lejos se ve UN buque, que es lo que se ve de lejos.
  const cerca = Math.hypot(A.pos.x, A.pos.z) < PS.POPUP_DIST_M;
  for (const z of zones) {
    if (!cerca) break;
    const r = world3D.zoneRect3D(z.id);
    if (!r || r.w > W * 1.6) continue;                  // del lado ciego, fuera de cuadro o encima
    if (z.hp <= 0) {
      if (Math.random() < 0.25) parts.push({
        x: r.x + Math.random() * r.w, y: r.y, vx: (Math.random() - 0.5) * 8,
        vy: -(10 + Math.random() * 12), life: 0.8, c: '#3a3f43', r: 1.5,
      });
      continue;
    }
    if (Math.sin(A.t * 7) > -0.4) {
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

  // ---- efectos del mundo: bombas en vuelo, columnas de agua, el hundimiento ----
  for (const f of A.fx) {
    if (f.k === 'bomb') {
      // LA BOMBA: un punto con estela corta hacia atras. Se la ve CAER — que es de donde sale toda
      // la lectura de la suelta: si la ves pasar larga, soltaste tarde.
      const hp = world3D.project(f.x, f.y, f.z);
      if (!hp.vis) continue;
      const tp = world3D.project(f.x - f.vx * 0.12, f.y - f.vy * 0.12, f.z - f.vz * 0.12);
      ctx.globalAlpha = 0.5; ctx.strokeStyle = f.sapito ? P.accent : '#c9ccc7'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.lineTo(hp.x, hp.y); ctx.stroke();
      ctx.globalAlpha = 1;
      px(hp.x - 1, hp.y - 1, 3, 3, f.sapito ? P.accent : '#e8e4d8');
      continue;
    }
    if (f.k === 'splash') {
      // COLUMNA DE AGUA / hongo del impacto, en el mundo
      const wp = world3D.project(f.x, f.y, f.z);
      if (!wp.vis) continue;
      const a = Math.min(1, f.life), r2 = 3 + f.vr * f.T;
      ctx.globalAlpha = a * (f.T < 0.12 ? 0.95 : 0.5);
      ctx.fillStyle = f.T < 0.12 ? P.warn : '#8d949a';
      ctx.beginPath(); ctx.arc(wp.x, wp.y, r2, 0, 7); ctx.fill();
      if (f.T >= 0.12) { ctx.fillStyle = '#c9ccc7'; ctx.beginPath(); ctx.arc(wp.x, wp.y - r2 * 0.5, r2 * 0.5, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
      continue;
    }
    const a = Math.min(1, f.life), r2 = 2 + f.vr * f.T;
    ctx.globalAlpha = a * (f.T < 0.12 ? 0.95 : 0.45);
    ctx.fillStyle = f.T < 0.12 ? P.warn : '#7c838a';
    ctx.beginPath(); ctx.arc(f.x, f.y, r2, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
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
  if (w.view === 1) drawCockpit({ mom: { t: A.t, hitFx: A.hitFx }, t: w.t, yOff: COCKPIT_Y });
  else drawThirdPlane(A, selPlane);

  // ---- MIRA: proyectada desde el MUNDO, sobre el punto adonde apunta el morro ----
  const app = world3D.project(A.pos.x + A.fwd.x * 400, A.pos.y + A.fwd.y * 400, A.pos.z + A.fwd.z * 400);
  const ax = app.vis ? app.x : W / 2, ay = app.vis ? app.y : H / 2;
  if (!drawMira(cfg.mira, ax, ay, 16, A.hitFx ? 1 : 0.85)) {
    const mc = A.hitFx ? P.accent : P.ink;
    ctx.strokeStyle = mc; ctx.globalAlpha = 0.9;
    ctx.strokeRect(ax - 5, ay - 5, 10, 10);
    ctx.globalAlpha = 1;
    px(ax - 7, ay, 3, 1, mc); px(ax + 5, ay, 3, 1, mc);
    px(ax, ay - 7, 1, 3, mc); px(ax, ay + 5, 1, 3, mc);
  }

  // ---- MIRA DE SUELTA: donde va a caer la bomba si la soltas AHORA ----
  // La bomba hereda 100 m/s y cae con gravedad real: a 35 m de altura el adelanto son ~270 metros.
  // Sin esta marca la suelta es adivinar. Es la unica asistencia que el modo se permite
  // (PROPUESTAS §3.4) y por eso es DISCRETA: dice donde cae, no si esta bien.
  // Y DESAPARECE EN EL RAS: abajo de SAPITO_ALT_M no hay marca (RF-07, "sin asistencia de mira: es
  // a ojo"). El sapito es el premio del que sabe, y con la mira puesta dejaba de ser un premio.
  const ip = A.pos.y >= PS.SAPITO_ALT_M ? w.impact : null;
  if (ip) {
    const bp = world3D.project(ip.x, ip.y, ip.z);
    if (bp.vis) {
      const dulce = A.banda === 'dulce';
      ctx.strokeStyle = dulce ? P.accent : P.dim; ctx.globalAlpha = dulce ? 0.9 : 0.55;
      ctx.beginPath(); ctx.arc(bp.x, bp.y, 4, 0, 7); ctx.stroke();
      px(bp.x - 6, bp.y, 3, 1, ctx.strokeStyle); px(bp.x + 4, bp.y, 3, 1, ctx.strokeStyle);
      ctx.globalAlpha = 1;
    }
  }

  // ---- flecha al buque si quedo fuera de cuadro ----
  const sp = world3D.project(0, 20, 0);
  if (!sp.vis || sp.x < 8 || sp.x > W - 8 || sp.y < 16 || sp.y > H - 16) shipArrow(sp);

  // ---- letterbox + tablero ----
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, 13); ctx.fillRect(0, H - 13, W, 13);
  ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.warn;
  ctx.fillText(T('pasada_title') + '  ·  ' + objectiveShip, W / 2, 9);

  if (dmgShown()) {
    const iv = Math.max(0, Math.min(1, run.integ / 100));
    px(6, 5, 44, 3, '#2e3c45');
    px(6, 5, 44 * iv, 3, iv <= 0.25 ? (Math.sin(A.t * 10) > 0 ? '#ff5340' : P.warn) : iv <= 0.5 ? P.warn : P.foam);
  }

  // ALTURA con el TECHO DE RADAR como referencia: es el unico numero que en esta fase decide algo
  // por si solo (RF-03 — abajo del techo el Sea Dart no existe), asi que se pinta distinto cuando
  // estas a ras. El indicador completo de la banda de armado llega en P5.
  ctx.font = '6px monospace'; ctx.textAlign = 'left';
  const bajo = A.pos.y < PS.RADAR_CEIL_M;
  ctx.fillStyle = bajo ? P.foam : P.dim;
  ctx.fillText('ALT ' + (A.pos.y | 0) + ' m', 6, H - 4);
  // BANDA DE ARMADO al lado de la altura: es la MISMA información leída de otra manera, y sin ella
  // los tres resultados de la suelta son magia. (El indicador grande es P5; esto es la palabra.)
  const bandaCol = A.banda === 'dulce' ? P.accent : A.banda === 'dormida' ? '#ff5340' : P.dim;
  ctx.fillStyle = bandaCol;
  ctx.fillText(T('pasada_band_' + (A.banda || 'dormida')), 52, H - 4);
  ctx.fillStyle = P.dim;
  ctx.fillText('VEL ' + ((A.spd * 3.6) | 0) + ' km/h', 100, H - 4);
  ctx.fillText(T('pasada_run') + ' ' + A.corrida, 156, H - 4);
  // LA RISTRA: una casilla por bomba, pegada al numero de corrida — las dos cuentan lo mismo,
  // cuanto te queda de ESTA pasada. El renglon es de 480 px y esta medido: ALT 6 · banda 52 ·
  // VEL 100 · CORRIDA 156 · ristra 196 · zonas al centro (223) · escuadron 265. Si se agrega algo,
  // se mide de nuevo: acá ya se encimo una vez.
  for (let i = 0; i < PS.BOMBS_N; i++)
    px(196 + i * 6, H - 8, 4, 3, i < A.bombs ? P.warn : '#2e3c45');

  // zonas como casillas (progreso del asalto) + escuadron
  const zw = zones.length * 7;
  for (let i = 0; i < zones.length; i++)
    px(W / 2 - zw / 2 + i * 7, H - 9, 5, 3, zones[i].hp <= 0 ? P.warn : '#2e3c45');
  if (run.squad > 1) {
    ctx.textAlign = 'left'; ctx.fillText(T('arena_squad'), W / 2 + zw / 2 + 8, H - 4);
    for (let i = 0; i < run.squad; i++)
      px(W / 2 + zw / 2 + 34 + i * 6, H - 9, 4, 3, i < run.lives ? P.accent : '#2e3c45');
  }

  // ---- AVISO DE MAR: la contracara de volar a ras. El mar puede matar, no puede matar en silencio ----
  if (A.lowT > 0 && A.doneT <= 0) {
    ctx.globalAlpha = 0.28 + 0.22 * Math.sin(A.t * 16);
    const g = ctx.createLinearGradient(0, H - 46, 0, H);
    g.addColorStop(0, '#ff534000'); g.addColorStop(1, '#ff5340');
    ctx.fillStyle = g; ctx.fillRect(0, H - 46, W, 46);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center'; ctx.font = 'bold 9px monospace';
    ctx.fillStyle = Math.sin(A.t * 16) > 0 ? '#ff5340' : P.warn;
    ctx.fillText(T('arena_low'), W / 2, H - 24);
  }

  // ---- la correa de la zona: aviso y piloto automatico ----
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
    ctx.fillText(T('pasada_hint'), W / 2, 21);
  }
}
