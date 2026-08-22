// ============================================================================================
// PENDIENTE — EN CUARENTENA DESDE EL 18/8/2026. Ver PLAN_REFACTOR §4b.
//
// Este modulo NO participa del menu ni de ningun flujo de campaña/ciclo: la perilla esta en
// data/cuarentena.js. Sigue compilando y su fixture sigue verde a proposito — es lo unico que
// avisa si se pudre mientras espera. NO se pule ni se refactoriza mas alla de lo mecanico: se
// revisa a fondo despues, y la hipotesis a explorar es entrar como modulo de una mision.
// ============================================================================================
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
import { drawCockpit, salpicar } from '../legacy/momentum_render.js';
import * as world3D from '../systems/three-arena.js';
import { AR } from '../data/arena.js';
import { turnGain } from '../core/aero.js';
import { shown as dmgShown } from '../systems/damage.js';

// DONDE APUNTA ESTE MODO, en Y de pantalla. En 1a persona la mira cae donde apunta el morro, o
// sea el centro (H/2 = 135). No es un offset del PNG: la cabina se acomoda SOLA para que su visor
// pintado caiga justo aca (ver V_VISOR / MIRA_PLENA en legacy/momentum_render.js). Antes esto era un
// `COCKPIT_Y` tuneado a mano contra el asset, y cada recambio de cabina lo dejaba viejo.
// EXPORTADA porque la PASADA dibuja la misma cabina con la misma camara.
export const COCKPIT_MIRA = H / 2;

// ALTURA bajo la cual el mar salpica el vidrio (F3.3). Es la misma que usa la PASADA para su
// suelta a ras (SAPITO_ALT_M): abajo de eso estas rozando el Atlantico, y se tiene que notar.
const SAL_ALT_M = 12;

/** El avion en TERCERA persona: el sprite de vuelo (vista trasera) con el alabeo y el cabeceo
 *  reales de la maniobra. La camara va detras, asi que el avion siempre se ve de atras — que es
 *  justo la vista para la que estan horneadas las hojas. */
// EXPORTADA para la fase PASADA (render/pasada.js): es el mismo avion visto desde la misma camara,
// asi que copiarla seria tener dos verdades sobre como se ve el Pichon de atras. Exportar no le
// cambia el comportamiento al arena — la condicion que pone el SPEC_MODO_PASADA §9.8.
export function drawThirdPlane(A, selPlane) {
  const pl = PLANES[selPlane];
  if (!pl.sheetOk) return;
  // el banqueo del sprite se normaliza al ROLL_MAX del modelo: banqueo pleno = hoja al tope
  const bank = Math.max(-1, Math.min(1, A.roll / AR.ROLL_MAX));
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

/** Flecha al borde de pantalla apuntando al buque cuando quedo fuera de cuadro.
 *  EXPORTADA para la PASADA por la misma razon que drawThirdPlane: perder el buque de vista pasa
 *  igual en las dos fases, y la respuesta tiene que ser la misma flecha. */
export function shipArrow(sp) {
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

/** Cuña roja en el borde apuntando a una amenaza que quedo FUERA DE CUADRO. Ya existia para el
 *  flak; ahora la comparten las tres cosas que matan. Una amenaza que no se puede ver tiene que
 *  poder INTUIRSE, o la muerte es un misterio. */
function threatWedge(wp, vis, hot) {
  const cx = W / 2, cy = H / 2;
  let ex = wp.x, ey = wp.y;
  if (!vis) { ex = cx - (wp.x - cx); ey = cy - (wp.y - cy); }   // detras: la direccion es la opuesta
  const el = Math.hypot(ex - cx, ey - cy) || 1;
  ex = cx + (ex - cx) / el * 92; ey = cy + (ey - cy) / el * 92;
  ctx.save();
  ctx.translate(ex, ey); ctx.rotate(Math.atan2(ey - cy, ex - cx));
  ctx.fillStyle = '#ff5340'; ctx.globalAlpha = hot ? 0.95 : 0.55;
  ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-5, -6); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1; ctx.restore();
}

/** LO QUE MATA, dibujado ENCIMA DE LA CABINA.
 *
 *  Playtest 15/8: "en 1a persona es injugable, se escucha el tiro y al toque te matan". La causa
 *  no era la dificultad: el PNG de la cabina se dibuja despues de los fx y TAPABA las trazadoras
 *  letales. Con el parabrisas ocupando media pantalla, la amenaza existia y era invisible.
 *
 *  La regla que queda escrita: en el arena, todo lo que puede matarte se dibuja al final. Si algo
 *  nuevo mata, va aca — no en el bucle de fx. */
function drawThreats(A) {
  for (const f of A.fx) {
    if (f.k === 'mg') {
      // METRALLETA: la ESTELA. Cada ronda es un trazo LARGO en la direccion de vuelo, y como la
      // rafaga sale escalonada, juntas dibujan una linea que se ve salir del buque y pasar. Ese
      // "se ve salir y pasar" es todo el pedido del playtest: antes no habia disparo que ver.
      if (f.wait > 0) continue;
      const hp2 = world3D.project(f.x, f.y, f.z);
      if (!hp2.vis) continue;
      const tp = world3D.project(f.x - f.vx * 0.16, f.y - f.vy * 0.16, f.z - f.vz * 0.16);
      const a = Math.min(1, f.life * 2);
      ctx.globalAlpha = a * 0.45; ctx.strokeStyle = '#ff5340'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.lineTo(hp2.x, hp2.y); ctx.stroke();
      ctx.globalAlpha = a; ctx.strokeStyle = P.warn; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.lineTo(hp2.x, hp2.y); ctx.stroke();
      ctx.lineWidth = 1; ctx.globalAlpha = 1;
      px(hp2.x - 1, hp2.y - 1, 2, 2, '#ffffff');
    } else if (f.k === 'aa') {
      // ANTIAEREO: el pepinazo. Bola con halo que late mas rapido cuanto mas cerca, estela de
      // humo larga y cuña en el borde si viene de afuera de cuadro. Es lento a proposito: tiene
      // que poder LEERSE mientras viaja, que es lo que el flak instantaneo nunca dejo hacer.
      if (f.wait > 0) continue;
      const hp2 = world3D.project(f.x, f.y, f.z);
      const cerca = f.d < 160;
      if (!hp2.vis || hp2.x < 4 || hp2.x > W - 4 || hp2.y < 16 || hp2.y > H - 16) {
        if (f.d < 320) threatWedge(hp2, hp2.vis, cerca);
        continue;
      }
      const tp = world3D.project(f.x - f.vx * 0.3, f.y - f.vy * 0.3, f.z - f.vz * 0.3);
      ctx.globalAlpha = 0.30; ctx.strokeStyle = '#8d949a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.lineTo(hp2.x, hp2.y); ctx.stroke();
      ctx.lineWidth = 1; ctx.globalAlpha = 1;
      const late = Math.sin(A.t * (cerca ? 26 : 12)) > 0;
      ctx.strokeStyle = late ? '#ff5340' : P.warn; ctx.globalAlpha = 0.95;
      ctx.beginPath(); ctx.arc(hp2.x, hp2.y, cerca ? 7 : 4.5, 0, 7); ctx.stroke();
      ctx.globalAlpha = 1;
      px(hp2.x - 1, hp2.y - 1, 3, 3, '#ffffff');
    } else if (f.k === 'hm3') {
      // MISIL GUIADO: la amenaza que se VE venir. Punto blanco con halo que LATE mas rapido
      // cuanto mas cerca esta, y estela de humo. Si queda fuera de cuadro, la cuña lo dice —
      // perseguirte a ciegas seria la misma trampa que acabamos de sacar.
      const hp2 = world3D.project(f.x, f.y, f.z);
      const cerca = f.d < 220;
      if (!hp2.vis || hp2.x < 4 || hp2.x > W - 4 || hp2.y < 16 || hp2.y > H - 16) {
        threatWedge(hp2, hp2.vis, cerca);
        continue;
      }
      const tp = world3D.project(f.x - f.dx * 40, f.y - f.dy * 40, f.z - f.dz * 40);
      ctx.globalAlpha = 0.35; ctx.strokeStyle = '#7c838a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.lineTo(hp2.x, hp2.y); ctx.stroke();
      ctx.lineWidth = 1; ctx.globalAlpha = 1;
      const late = Math.sin(A.t * (cerca ? 22 : 11)) > 0;
      const r2 = cerca ? 6 : 4;
      ctx.strokeStyle = late ? '#ff5340' : P.warn; ctx.globalAlpha = 0.95;
      ctx.beginPath(); ctx.arc(hp2.x, hp2.y, r2, 0, 7); ctx.stroke();
      ctx.globalAlpha = 1;
      px(hp2.x - 1, hp2.y - 1, 3, 3, '#ffffff');
    }
  }
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
    // PINTADO (E5): la zona ya marcada deja de titilar y queda en el acento, fija. Es la
    // diferencia entre "hay un blanco ahi" (titila) y "este ya es mio" (queda prendido).
    const painted = A.paint.indexOf(z.id) >= 0;
    // ZONA ABIERTA (stagger, E6): al rojo BLANCO y con el corchete grueso. Es la ventana de
    // castigo y tiene que gritarse desde lejos — es la unica cosa de la pelea que se paga sola.
    const open = z.open > 0;
    const blink = open || painted || Math.sin(A.t * 7) > -0.4;
    if (blink) {
      ctx.strokeStyle = open ? '#ffffff' : painted ? P.accent : P.warn;
      ctx.lineWidth = open ? 2 : 1; ctx.globalAlpha = 0.9;
      const c = Math.max(2, Math.min(r.w, r.h) * 0.28);
      ctx.beginPath();
      ctx.moveTo(r.x, r.y + c); ctx.lineTo(r.x, r.y); ctx.lineTo(r.x + c, r.y);
      ctx.moveTo(r.x + r.w - c, r.y); ctx.lineTo(r.x + r.w, r.y); ctx.lineTo(r.x + r.w, r.y + c);
      ctx.moveTo(r.x, r.y + r.h - c); ctx.lineTo(r.x, r.y + r.h); ctx.lineTo(r.x + c, r.y + r.h);
      ctx.moveTo(r.x + r.w - c, r.y + r.h); ctx.lineTo(r.x + r.w, r.y + r.h); ctx.lineTo(r.x + r.w, r.y + r.h - c);
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    // el reticulo ESTA pintando esta zona: el arco de carga dice cuanto falta. Sin esto, pintar
    // es un tiempo muerto sin respuesta y se suelta el boton antes de que enganche.
    if (A.paintZ === z.id) {
      const k = Math.min(1, A.paintT / AR.PAINT_T);
      ctx.strokeStyle = P.accent; ctx.globalAlpha = 0.9; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(r.x + r.w / 2, r.y + r.h / 2, Math.max(6, Math.min(r.w, r.h) * 0.6), -Math.PI / 2, -Math.PI / 2 + k * 6.283);
      ctx.stroke(); ctx.lineWidth = 1; ctx.globalAlpha = 1;
    }
    ctx.font = '6px monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = open ? '#ffffff' : painted ? P.accent : P.warn;
    ctx.fillText(open ? T('arena_open') : T(z.label), r.x + r.w / 2, r.y - 3);
    const bw = Math.min(r.w, 40), bx0 = r.x + (r.w - bw) / 2;
    px(bx0, r.y + r.h + 2, bw, 2, '#2e3c45');
    px(bx0, r.y + r.h + 2, bw * (z.hp / z.maxHp), 2, P.warn);
    // BARRA DE STAGGER: va DEBAJO de la de vida y en otro color, porque cuenta otra cosa. La de
    // arriba es cuanto le falta a la zona; esta es cuanto te falta para ABRIRLA — y como decae
    // sola, verla bajar es lo que dice "no dejes de pegar".
    if (z.st > 0 && !open) px(bx0, r.y + r.h + 5, bw * Math.min(1, z.st), 1, P.foam);
  }

  // ---- proyectiles propios: del ala al punto apuntado, en el MUNDO ----
  // OJO CON EL ORDEN: lo que se dibuje ACA queda DEBAJO de la cabina (drawCockpit, mas abajo).
  // Todo lo que MATA se dibuja despues, en drawThreats() — ver el porque ahi.
  for (const f of A.fx) {
    if (f.k === 'mg' || f.k === 'aa' || f.k === 'hm3') continue;   // lo que mata: encima de todo
    if (f.k === 'bl') {
      // BALA: ya no es una animacion del ala al blanco — es un punto del MUNDO con su estela.
      // Se proyecta igual que la trazadora enemiga, y por eso se le puede ver el TIEMPO DE VUELO.
      const hp2 = world3D.project(f.px, f.py, f.pz);
      if (!hp2.vis) continue;
      const tp = world3D.project(f.px - f.dx * 26, f.py - f.dy * 26, f.pz - f.dz * 26);
      ctx.globalAlpha = 0.45; ctx.strokeStyle = P.accent; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.lineTo(hp2.x, hp2.y); ctx.stroke();
      ctx.globalAlpha = 1;
      px(hp2.x - 1, hp2.y - 1, 2, 2, P.foam);
    } else if (f.k === 'ms') {
      const t = Math.min(1, f.T / f.dur);
      const ap = world3D.project(f.aim.x, f.aim.y, f.aim.z);
      const ox = W / 2 + f.side * 26, oy = H * 0.60;
      const fx2 = ox + (ap.x - ox) * t, fy2 = oy + (ap.y - oy) * t;
      if (t < 1) {
        const dl = Math.hypot(ap.x - ox, ap.y - oy) || 1;
        const ux = (ap.x - ox) / dl, uy = (ap.y - oy) / dl;
        const L = 9;
        ctx.globalAlpha = 0.35; ctx.strokeStyle = P.warn; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(fx2 - ux * L * 1.6, fy2 - uy * L * 1.6); ctx.lineTo(fx2, fy2); ctx.stroke();
        ctx.globalAlpha = 0.95; ctx.strokeStyle = P.accent; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(fx2 - ux * L * 0.7, fy2 - uy * L * 0.7); ctx.lineTo(fx2, fy2); ctx.stroke();
        ctx.lineWidth = 1; ctx.globalAlpha = 1;
        px(fx2 - 1, fy2 - 1, 3, 3, P.foam);
      } else {
        ctx.globalAlpha = Math.min(1, f.life * 2.5);
        px(ap.x - 2, ap.y - 2, 4, 4, f.zone ? P.accent : P.foam);
        ctx.globalAlpha = 1;
      }
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
    // SAL EN EL PARABRISAS (F3.3): misma regla que en la PASADA — cabina y agua cerca.
    if (A.pos.y < SAL_ALT_M) salpicar(1 - A.pos.y / SAL_ALT_M);
    drawCockpit({ mom: { t: A.t, hitFx: A.hitFx }, t: w.t, mira: COCKPIT_MIRA });
    if (A.flashL > 0) { ctx.globalAlpha = Math.min(1, A.flashL * 9); px(0, 56, 9, 15, '#ffffff'); ctx.globalAlpha = 1; }
    if (A.flashR > 0) { ctx.globalAlpha = Math.min(1, A.flashR * 9); px(W - 9, 56, 9, 15, '#ffffff'); ctx.globalAlpha = 1; }
  } else drawThirdPlane(A, selPlane);

  // ---- LO QUE MATA, POR ENCIMA DE LA CABINA (ver drawThreats) ----
  drawThreats(A);

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

  // ---- VECTOR DE VUELO (S2): adonde va el AVION, que derrapando NO es adonde apunta el morro.
  // Es el simbolo que cualquier HUD de vuelo real dibuja, y aca gana su pixel recien ahora: sin
  // drift caia siempre encima de la mira y solo hubiera sido ruido. Se dibuja cuando se SEPARA.
  const vp = world3D.project(A.pos.x + A.vel.x * 400, A.pos.y + A.vel.y * 400, A.pos.z + A.vel.z * 400);
  if (vp.vis && Math.hypot(vp.x - ax, vp.y - ay) > 5) {
    ctx.strokeStyle = A.drift ? P.accent : P.dim; ctx.globalAlpha = A.drift ? 0.95 : 0.5;
    ctx.beginPath(); ctx.arc(vp.x, vp.y, 3.5, 0, 7); ctx.stroke();
    px(vp.x - 8, vp.y, 4, 1, ctx.strokeStyle); px(vp.x + 5, vp.y, 4, 1, ctx.strokeStyle);
    px(vp.x, vp.y - 7, 1, 3, ctx.strokeStyle);
    ctx.globalAlpha = 1;
  }

  // ---- flecha al buque si quedo fuera de cuadro ----
  const sp = world3D.project(0, 20, 0);
  if (!sp.vis || sp.x < 8 || sp.x > W - 8 || sp.y < 16 || sp.y > H - 16) shipArrow(sp);

  // ---- letterbox + tablero ----
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, 13); ctx.fillRect(0, H - 13, W, 13);
  ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.warn;
  ctx.fillText(T('mom_title') + '  ·  ' + objectiveShip, W / 2, 9);

  // CALOR DEL CAÑON (E5): el arena dejo de tener un boton de disparo infinito. Va arriba a la
  // IZQUIERDA — el tablero de abajo ya esta lleno y arriba a la derecha vive el indicador de
  // musica. RECALENTADO se grita: dejar de disparar sin saber por que es la version del
  // "explota y no se por que" aplicada al cañon.
  px(6, 5, 44, 3, '#2e3c45');
  px(6, 5, 44 * Math.min(1, run.heat), 3, run.overheat ? '#ff5340' : P.accent);
  if (run.overheat) {
    ctx.font = '6px monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = Math.sin(A.t * 16) > 0 ? '#ff5340' : P.warn;
    ctx.fillText(T('bar_overheat'), 54, 9);
  }

  // altura y velocidad: la referencia basica de un vuelo libre
  ctx.font = '6px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = P.dim;
  ctx.fillText('ALT ' + (A.pos.y | 0) + ' m', 6, H - 4);
  // INTEGRIDAD: misma regla que el pasillo — se dibuja solo si el modelo de vida la usa. Va
  // arriba a la izquierda, debajo del calor del cañon, que es la otra barra del avion.
  if (dmgShown()) {
    const iv = Math.max(0, Math.min(1, run.integ / 100));
    px(6, 10, 44, 3, '#2e3c45');
    px(6, 10, 44 * iv, 3, iv <= 0.25 ? (Math.sin(A.t * 10) > 0 ? '#ff5340' : P.warn) : iv <= 0.5 ? P.warn : P.foam);
  }
  // SWEET SPOT (S3): la velocidad se pinta en el acento cuando el avion esta en la banda donde el
  // giro aprieta. Es la forma mas barata de enseñar la mecanica — el numero que ya estabas
  // mirando cambia de color y abajo aparece por que. Una cinta de velocidad con marca no entra
  // a 480x270 sin comerse el tablero.
  const sweet = turnGain(A.spd) > 1.15;
  ctx.fillStyle = sweet ? P.accent : P.dim;
  ctx.fillText('VEL ' + ((A.spd * 3.6) | 0) + ' km/h', 66, H - 4);
  if (sweet) { ctx.fillStyle = P.accent; ctx.fillText(T('arena_sweet'), 66, H - 10); }
  ctx.fillStyle = P.dim;

  // REPARTO DE ENERGIA (S1): tres casillas y el nombre. Va entre la velocidad y los misiles, que
  // era el unico hueco libre del tablero — el presupuesto de HUD del arena ya estaba gastado, y
  // este indicador REPARTE espacio, no lo suma (SQUADRONS_UPDATE §5: nada de sopa de medidores).
  // Cual esta puesto se lee por POSICION y por color, sin leer la palabra.
  const pipI = Math.max(0, AR.PIP_ORDER.indexOf(w.pip));
  for (let i = 0; i < AR.PIP_ORDER.length; i++)
    px(136 + i * 6, H - 8, 4, 3, i === pipI ? P.accent : '#2e3c45');
  // el nombre va AL LADO de las casillas, no debajo: el renglon del tablero mide 13 px y el
  // texto de 6 px le sube el asta hasta donde estan las casillas — encimados, no se leia ninguno
  ctx.font = '6px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = P.dim;
  ctx.fillText(T('arena_pip_' + w.pip), 158, H - 4);

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

  // ---- BURBUJA DE DEFENSA CERCANA (E6): el borde late mientras estas adentro ----
  // No es un cartel: es el cuadro entero avisando que el buque cambio de registro. Discreto a
  // proposito — lo que mata es el patron, y el patron ya se ve. Esto solo dice DONDE estas.
  if (A.bubble && A.doneT <= 0) {
    ctx.globalAlpha = 0.10 + 0.07 * Math.sin(A.t * 9);
    ctx.strokeStyle = '#ff5340'; ctx.lineWidth = 6;
    ctx.strokeRect(3, 16, W - 6, H - 32);
    ctx.lineWidth = 1; ctx.globalAlpha = 1;
    // el rotulo va a la MISMA altura que los avisos del ring (30) y no a 21: ahi vive el cartel
    // de controles de los primeros 4 s, y los dos textos se encimaban ilegibles. Nunca coinciden:
    // la burbuja es a menos de 250 m del casco y el ring avisa pasados los 700
    ctx.textAlign = 'center'; ctx.font = '6px monospace';
    ctx.fillStyle = Math.sin(A.t * 9) > 0 ? '#ff5340' : P.warn;
    ctx.fillText(T('arena_bubble'), W / 2, 30);
  }

  // ---- AVISO DE MAR: bajo y cayendo, el borde inferior se enciende y el HUD grita ----
  // Es la contracara del SEA_KILL: el mar puede matar, pero no puede matar EN SILENCIO.
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
