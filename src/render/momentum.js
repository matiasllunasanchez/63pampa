// RENDER del MOMENTUM: el climax en primera persona (barcaza, zonas criticas, cabina y visor).
//
// El fondo 3D lo pone systems/three-world.js; aca va la capa 2D que se dibuja ENCIMA: el casco
// (solo si el 3D no esta activo), las zonas que hay que destruir, los efectos y la cabina.
//
// Como el resto del render, recibe `w`: un snapshot de solo lectura. Ademas de valores, trae tres
// FUNCIONES del momentum (momCam, momShipGeom, momZoneRect) porque la geometria cambia por frame
// y hay que consultarla al dibujar, no antes.
import { ctx, W, H, px, panel } from './ctx.js';
import { P } from '../data/palette.js';
import { T } from '../core/i18n.js';
import { MOM_AX, MOM_AY, MSL_MAX, REATTACK_DUR } from '../data/tuning.js';

// arte de la cabina (marco del visor). Se precarga al importar; hasta que este listo se
// dibuja el fallback vectorial de abajo, asi el primer momentum nunca aparece vacio.
const COCKPIT_ASSET = { src: '../assets/planes/a4-skyhawk/cockpit.png', img: new Image(), ready: false };
COCKPIT_ASSET.img.onload = () => { COCKPIT_ASSET.ready = true; };
COCKPIT_ASSET.img.src = COCKPIT_ASSET.src;

// casco + superestructura de la barcaza (compartido: momentum y aproximacion en vuelo normal)
// `t` es el tiempo del juego: mueve la espuma de la linea de flotacion. Se recibe por parametro
// (y no del snapshot) porque esta funcion tambien la usa la aproximacion en vuelo normal.
export function drawBargeHull(cx0, len, deckY, uh, t) {
  const x0 = cx0 - len / 2, x1 = cx0 + len / 2, hullH = uh * 1.5;
  if (uh < 1.1) {   // muy lejos: silueta simple en el horizonte
    px(cx0 - len * 0.15, deckY - Math.max(1, uh * 2.2), len * 0.24, Math.max(1, uh * 2.2), P.bodyDark);
    px(x0, deckY, len, Math.max(1, hullH), P.bodyDark);
    return;
  }
  px(x0, deckY, len, hullH, P.bodyDark);
  px(x0 - uh * 0.7, deckY, uh * 0.7, hullH * 0.65, P.bodyDark);          // proa
  px(x1, deckY, uh * 0.5, hullH * 0.6, P.bodyDark);                    // popa
  px(x0, deckY, len, Math.max(1, uh * 0.28), '#5c6e73');             // cubierta
  px(x0, deckY + hullH - 2, len, 2, '#1c262e');                    // flotacion
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 6; i++) px(x0 + (i / 6) * len + Math.sin(t * 3 + i) * 3, deckY + hullH - 1, uh * 0.8, 1, P.foam);
  ctx.globalAlpha = 1;
  px(cx0 - len * 0.15, deckY - uh * 2.6, len * 0.24, uh * 2.6, P.body);           // bloque puente
  px(cx0 - len * 0.12, deckY - uh * 2.3, len * 0.18, Math.max(1, uh * 0.5), P.canopy); // ventanas
  px(cx0 + len * 0.16, deckY - uh * 1.8, len * 0.05, uh * 1.8, '#454f56');        // chimenea
  px(cx0 + len * 0.095, deckY - uh * 3.9, Math.max(1, len * 0.012), uh * 3.9, '#454f56'); // mastil
  px(cx0 + len * 0.06, deckY - uh * 3.9, len * 0.08, Math.max(1, uh * 0.35), '#454f56'); // antena
  for (const s of [-0.52, 0.52]) {                                          // torretas AA
    px(cx0 + len / 2 * s - len * 0.05, deckY - uh * 1.1, len * 0.10, uh * 1.1, '#3d474d');
    px(cx0 + len / 2 * s - len * 0.008, deckY - uh * 1.55, Math.max(1, len * 0.016), uh * 0.6, '#2b3338');
  }
}

export function drawCockpit(w) {
  const { mom, t } = w;
  // solo bob de vuelo: la cabina es la trompa del avion, va clavada a la pantalla
  // (apuntar mueve el MUNDO detras del vidrio, no la cabina)
  const bx = Math.sin(mom.t * 1.4) * 1.5;
  const by = Math.sin(mom.t * 2.2) * 2;
  if (COCKPIT_ASSET.ready && COCKPIT_ASSET.img.naturalWidth) {
    ctx.drawImage(COCKPIT_ASSET.img, bx - 6, by - 6, W + 12, H + 12);   // sobredimensionado: el bob no muestra bordes
  } else {
    ctx.save();
    ctx.translate(bx, by);
    // parantes laterales del canopy (diagonales)
    ctx.fillStyle = '#10151a';
    ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(28, -8); ctx.lineTo(4, H - 28); ctx.lineTo(-8, H - 28); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W + 8, -8); ctx.lineTo(W - 28, -8); ctx.lineTo(W - 4, H - 28); ctx.lineTo(W + 8, H - 28); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2a343c';
    ctx.beginPath(); ctx.moveTo(28, -8); ctx.lineTo(4, H - 28); ctx.moveTo(W - 28, -8); ctx.lineTo(W - 4, H - 28); ctx.stroke();
    // capo / panel de instrumentos abajo
    ctx.fillStyle = '#0e1317';
    ctx.beginPath(); ctx.moveTo(-8, H + 8); ctx.lineTo(-8, H - 24); ctx.lineTo(W * 0.30, H - 33); ctx.lineTo(W * 0.70, H - 33); ctx.lineTo(W + 8, H - 24); ctx.lineTo(W + 8, H + 8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#39434b';
    ctx.beginPath(); ctx.moveTo(-8, H - 24); ctx.lineTo(W * 0.30, H - 33); ctx.lineTo(W * 0.70, H - 33); ctx.lineTo(W + 8, H - 24); ctx.stroke();
    // instrumentos placeholder: dos diales + luz de armamento
    px(W * 0.36, H - 28, 11, 9, '#1a2126'); px(W * 0.375, H - 25, 6, 1, P.accent);
    px(W * 0.53, H - 28, 11, 9, '#1a2126'); px(W * 0.55, H - 23, 5, 1, P.warn);
    px(W * 0.70, H - 30, 3, 3, mom.hitFx ? P.warn : '#3a2a1a');    // luz de canon
    // reflejo del vidrio (sutil)
    ctx.globalAlpha = 0.05; ctx.strokeStyle = '#eaf6ff'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(W * 0.20, 8); ctx.lineTo(W * 0.46, H - 42); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.30, 4); ctx.lineTo(W * 0.54, H - 46); ctx.stroke();
    ctx.globalAlpha = 1; ctx.lineWidth = 1;
    ctx.restore();
  }
  // (los canones estan en las alas, FUERA de la vista: las trazadoras se dibujan antes
  // de la cabina en drawMomentum y el marco las tapa — aca no va ningun fogonazo)
  return { bx, by };
}

// MOMENTUM: barcaza a lo largo, zonas criticas resaltadas, mira y ventana de tiempo
export function drawMomentum(w) {
  const { mom, momPhase, phases, msl, objectiveShip, t, is3D, parts, popups, mouse,
          momCam, momShipGeom, momZoneRect } = w;
  const ph = phases[momPhase], g = momShipGeom();
  // NOTA: seguimos en espacio-MUNDO ROTADO por el alabeo (aplicado en draw): el barco, las
  // zonas, los fx y las particulas giran con el mundo — al rolar ves la barcaza inclinarse

  // tinte de camara lenta sobre el fondo (extendido: la camara panea con la punteria, momCam)
  ctx.fillStyle = '#0a121a'; ctx.globalAlpha = 0.28; ctx.fillRect(-80, -80, W + 160, H + 160); ctx.globalAlpha = 1;

  // ---- barcaza (casco compartido; crece LENTO durante la pasada via momShipGeom) ----
  // en momentum-3D el barco lo pone three.js (blit de draw); el 2D queda de fallback
  if (!is3D) drawBargeHull(g.cx, g.len, g.deckY, g.uh, t);
  // zonas ya destruidas (de esta pasada): chamuscado + humo
  for (const z of mom.zones) {
    if (z.hp > 0) continue;
    const r = momZoneRect(z);
    px(r.x, r.y, r.w, r.h, '#16191c');
    if (Math.random() < 0.3) parts.push({
      x: r.x + Math.random() * r.w, y: r.y, vx: (Math.random() - 0.5) * 8,
      vy: -(12 + Math.random() * 14), life: 0.8, c: '#3a3f43', r: 1.5
    });
  }
  // nombre de la barcaza sobre el barco
  ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
  ctx.fillStyle = P.warn; ctx.fillText(objectiveShip, g.cx, g.deckY - g.uh * 4.6);

  // ---- zonas activas: corchetes titilantes + etiqueta + barra de HP ----
  for (const z of mom.zones) {
    if (z.hp <= 0) continue;
    const r = momZoneRect(z), blink = Math.sin(mom.t * 7) > -0.4;
    if (blink) {
      ctx.strokeStyle = P.warn; ctx.lineWidth = 1; ctx.globalAlpha = 0.9;
      const c = Math.max(2, r.w * 0.22);
      ctx.beginPath();
      ctx.moveTo(r.x, r.y + c); ctx.lineTo(r.x, r.y); ctx.lineTo(r.x + c, r.y);
      ctx.moveTo(r.x + r.w - c, r.y); ctx.lineTo(r.x + r.w, r.y); ctx.lineTo(r.x + r.w, r.y + c);
      ctx.moveTo(r.x, r.y + r.h - c); ctx.lineTo(r.x, r.y + r.h); ctx.lineTo(r.x + c, r.y + r.h);
      ctx.moveTo(r.x + r.w - c, r.y + r.h); ctx.lineTo(r.x + r.w, r.y + r.h); ctx.lineTo(r.x + r.w, r.y + r.h - c);
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    ctx.font = '6px monospace'; ctx.fillStyle = P.warn;
    ctx.fillText(T(z.label), r.x + r.w / 2, r.y - 3);
    px(r.x, r.y + r.h + 2, r.w, 2, '#2e3c45');                       // barra de HP
    px(r.x, r.y + r.h + 2, r.w * (z.hp / z.maxHp), 2, P.warn);
  }

  // FX de camara lenta (mundo): trazadoras AA con estela, flak expandiendose y rocio derivando
  for (const f of mom.fx) {
    const a = Math.min(1, f.life);
    if (f.k === 'tr') {
      const L = 3 + f.T * 9;                                    // la estela se alarga al acercarse
      const dl = Math.hypot(f.vx, f.vy) || 1, ux = f.vx / dl, uy = f.vy / dl;
      ctx.globalAlpha = a * 0.35; ctx.strokeStyle = P.warn;
      ctx.beginPath(); ctx.moveTo(f.x - ux * L * 1.8, f.y - uy * L * 1.8); ctx.lineTo(f.x, f.y); ctx.stroke();
      ctx.globalAlpha = a * 0.85;
      ctx.beginPath(); ctx.moveTo(f.x - ux * L, f.y - uy * L); ctx.lineTo(f.x, f.y); ctx.stroke();
      px(f.x - 1, f.y - 1, 2, 2, P.accent);
    } else if (f.k === 'sh') {                                // rafaga de canon: trazo grueso glow + nucleo
      const dl = Math.hypot(f.vx, f.vy) || 1, ux = f.vx / dl, uy = f.vy / dl;
      const L = 8 + Math.min(8, f.T * 6);
      ctx.globalAlpha = 0.35; ctx.strokeStyle = P.warn; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(f.x - ux * L, f.y - uy * L); ctx.lineTo(f.x, f.y); ctx.stroke();
      ctx.globalAlpha = 0.95; ctx.strokeStyle = P.accent; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(f.x - ux * L * 0.6, f.y - uy * L * 0.6); ctx.lineTo(f.x, f.y); ctx.stroke();
      ctx.lineWidth = 1;
    } else if (f.k === 'ms') {                                // misil del jugador: cuerpo + llama
      const dl = Math.hypot(f.vx, f.vy) || 1, ux = f.vx / dl, uy = f.vy / dl;
      ctx.globalAlpha = 1;
      px(f.x - ux * 3 - 1, f.y - uy * 3 - 1, 3, 3, P.ink);
      px(f.x - 1, f.y - 1, 2, 2, P.foam);
      px(f.x - ux * 6 - 1, f.y - uy * 6 - 1, 2, 2, P.accent);
    } else if (f.k === 'st') {
      ctx.globalAlpha = a * 0.4;
      px(f.x, f.y, f.len, 1, P.foam);
    } else {                                                  // 'fk': fogonazo breve → humo lento
      const r = 1 + f.vr * f.T;
      ctx.globalAlpha = a * (f.T < 0.14 ? 0.9 : 0.45);
      ctx.fillStyle = f.T < 0.14 ? P.warn : '#7c838a';
      ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, 7); ctx.fill();
      if (f.T >= 0.14) { ctx.fillStyle = '#565c63'; ctx.beginPath(); ctx.arc(f.x - r * 0.3, f.y + r * 0.2, r * 0.55, 0, 7); ctx.fill(); }
    }
  }
  ctx.globalAlpha = 1;

  // particulas y popups en espacio-MUNDO (anclados al barco/zonas), antes de la cabina
  for (const p of parts) { ctx.globalAlpha = Math.min(1, p.life * 2); px(p.x, p.y, p.r, p.r, p.c); }
  ctx.globalAlpha = 1;
  ctx.font = '7px monospace'; ctx.textAlign = 'center';
  for (const p of popups) { ctx.globalAlpha = Math.min(1, p.life); ctx.fillStyle = p.c; ctx.fillText(p.txt, p.x, p.y); }
  ctx.globalAlpha = 1;

  // de aca en adelante espacio-PANTALLA: se deshace el ROLL y el paneo de camara —
  // la cabina, la mira y el letterbox van NIVELADOS (vos rolas, tu marco no)
  const cm = momCam();
  {
    const rcx = W / 2 + cm.x, rcy = H / 2 + cm.y;
    ctx.translate(rcx, rcy); ctx.rotate(mom.roll); ctx.translate(-rcx, -rcy);
  }
  ctx.translate(cm.x, cm.y);

  // (las rafagas del canon ya no son lineas fijas: son proyectiles fx 'sh' que viajan
  // LENTOS por el mundo desde las alas — se dibujan arriba, antes de la cabina, y el
  // marco/panel los tapa al nacer)

  // ---- cabina en primer plano (camara desde adentro) ----
  drawCockpit(w);

  // ---- RESPLANDOR de disparo en los bordes: feedback INSTANTANEO al apretar fuego ----
  // (la bala tarda ~1.3s en cruzar el vidrio; sin esto parece que no responde)
  // PLACEHOLDER: cuadrados blancos — se reemplazara por asset (ver docs/UPDATE_ANIMATIONS.md)
  if (mom.flashL > 0) {
    ctx.globalAlpha = Math.min(1, mom.flashL * 9);
    px(0, 56, 9, 15, '#ffffff'); px(9, 60, 5, 8, '#ffffff'); px(14, 63, 3, 4, '#ffffff');
    ctx.globalAlpha = Math.min(0.5, mom.flashL * 4);
    px(0, 50, 20, 27, '#ffffff');                       // halo suave
    ctx.globalAlpha = 1;
  }
  if (mom.flashR > 0) {
    ctx.globalAlpha = Math.min(1, mom.flashR * 9);
    px(W - 9, 56, 9, 15, '#ffffff'); px(W - 14, 60, 5, 8, '#ffffff'); px(W - 17, 63, 3, 4, '#ffffff');
    ctx.globalAlpha = Math.min(0.5, mom.flashR * 4);
    px(W - 20, 50, 20, 27, '#ffffff');                  // halo suave
    ctx.globalAlpha = 1;
  }

  // ---- mira sobre el vidrio: LIBRE con mouse (PC) o fija al visor (tactil) + chispa ----
  const ax = mouse.on ? mouse.x : MOM_AX, ay = mouse.on ? mouse.y : MOM_AY;
  if (mom.hitFx) px(ax - 1, ay - 1, 2, 2, P.foam);
  const mc = mom.hitFx ? P.accent : P.ink;
  ctx.strokeStyle = mc; ctx.globalAlpha = 0.9;
  ctx.strokeRect(ax - 5, ay - 5, 10, 10);
  ctx.globalAlpha = 1;
  px(ax - 7, ay, 3, 1, mc); px(ax + 5, ay, 3, 1, mc);
  px(ax, ay - 7, 1, 3, mc); px(ax, ay + 5, 1, 3, mc);

  // ---- letterbox + titulo + ventana de tiempo ----
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, 13); ctx.fillRect(0, H - 13, W, 13);
  ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
  ctx.fillStyle = P.warn;
  ctx.fillText(T('mom_title') + '  ·  ' + T('mom_pass', { n: momPhase + 1, m: phases.length })
    + (mom.pass > 1 ? '  ·  ' + T('mom_pass_n', { n: mom.pass }) : ''), W / 2, 9);
  const tw = 90;
  px(W / 2 - tw / 2, H - 9, tw, 3, '#2e3c45');
  if (mom.turn > 0) {
    // VIRAJE: la barra se rellena al reves — es lo que falta para volver a tener el blanco
    const tp = 1 - Math.max(0, mom.turn) / REATTACK_DUR;
    px(W / 2 - tw / 2, H - 9, tw * tp, 3, P.foam);
  } else {
    const tfrac = Math.max(0, mom.timer / ph.time);
    px(W / 2 - tw / 2, H - 9, tw * tfrac, 3, tfrac < 0.3 ? P.warn : P.accent);   // roja cuando queda poco
  }
  // municion de misiles [Z] a la izquierda de la barra de tiempo
  ctx.font = '6px monospace'; ctx.textAlign = 'right'; ctx.fillStyle = P.dim;
  ctx.fillText('Z', W / 2 - tw / 2 - 26, H - 4);
  for (let i = 0; i < MSL_MAX; i++)
    px(W / 2 - tw / 2 - 22 + i * 6, H - 9, 4, 3, i < msl ? P.accent : '#2e3c45');
  ctx.textAlign = 'center';
  if (mom.doneT <= 0 && mom.t < 2.5) {
    ctx.font = '6px monospace'; ctx.fillStyle = P.dim;
    ctx.fillText(T('mom_hint'), W / 2, 21);   // bajo el titulo, para no pisar el avion en primer plano
  }
}
