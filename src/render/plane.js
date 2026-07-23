// RENDER DEL AVION: el sprite del jugador y su mira.
//
// Dibuja sombra, espuma, el sprite (hoja horneada con alabeo/cabeceo reales, o ilustracion, o
// fallback de rects), la vibracion del roce, los fantasmas de la pirueta, el postquemador y la
// sangre del atropello. Al final, la mira (libre con mouse, o adelante del avion en tactil).
//
// Recibe `selPlane` (que avion eligio el jugador — estado de menu, vive en game.js) y `viewMouse`
// (resuelve la mira segun la camara — la camara sigue en game.js). El resto lo lee de los stores.

import { ctx, px, PZ } from './ctx.js';
import { plane, cfg, S } from '../core/state.js';
import { run } from '../core/run.js';
import { inp } from '../core/input.js';
import { proj } from '../core/fx.js';
import { P } from '../data/palette.js';
import { PLANES, SHEET_NF, SHEET_FW, SHEET_FH } from '../data/planes.js';
import { ROLL_DUR } from '../data/tuning.js';

export function drawPlane(selPlane, viewMouse) {
  const s = proj(plane.x, plane.y, PZ);
  // sombra sobre el agua (referencia de altura)
  const sh = proj(plane.x, 0, PZ);
  ctx.globalAlpha = Math.max(0.08, 0.4 - plane.y * 0.009);
  px(sh.x - 9, sh.y, 18, 2, '#101c1e');
  // espuma batida justo debajo cuando vuela bajo (solo sobre agua)
  const churn = Math.max(0, 1 - plane.y / 7);
  if (churn > 0 && S.state === 'play' && cfg.terrain !== 'land') {
    ctx.globalAlpha = churn * 0.7;
    px(sh.x - 11, sh.y - 1, 22, 2, P.foam);
    px(sh.x - 15, sh.y, 30, 1, P.crest);
  }
  ctx.globalAlpha = 1;

  ctx.save();
  // sub-pixel + bob de vuelo (nunca queda congelado) + micro-oscilación de alabeo en el aire
  const bob = (S.state === 'play' ? Math.sin(run.t * 3.1) * 0.5 + Math.sin(run.t * 1.7) * 0.3 : 0);
  // VIBRACION al rozar la superficie: temblor rapido del fuselaje (el avion, no la camara)
  const vx2 = run.scrapeVib ? (Math.random() - 0.5) * 3.2 * run.scrapeVib : 0;
  const vy2 = run.scrapeVib ? (Math.random() - 0.5) * 2.4 * run.scrapeVib : 0;
  ctx.translate(s.x + vx2, s.y - bob + vy2);
  // cabeceo: el morro sube al trepar / baja al caer (desplazamiento vertical del sprite)
  ctx.translate(0, -plane.pitch * 1.2);
  // alabeo: rotación 2D + micro-wobble; el foreshortening en X finge la inclinación 3D del ala
  const bank = Math.max(-1, Math.min(1, plane.bank));
  const pl = PLANES[selPlane];
  const useSheet = pl.sheetOk;   // sprite HORNEADO: el alabeo lo traen los frames
  let rolling = run.rollT > 0;
  if (rolling) {
    // PIRUETA: tonel completo — el sprite (vista trasera) rota 360° en el plano de pantalla
    const pr = 1 - run.rollT / ROLL_DUR;                   // 0→1 durante el tonel
    ctx.rotate(run.rollDir * pr * Math.PI * 2);
    ctx.scale(0.94 + 0.06 * Math.cos(pr * Math.PI * 2), 1);   // leve pulso: vende el giro
  } else if (useSheet) {
    // con frames de alabeo Y cabeceo REALES no hay rotacion ni squash fingidos: solo micro-wobble
    ctx.rotate(S.state === 'play' ? Math.sin(run.t * 2.3) * 0.015 : 0);
  } else {
    ctx.rotate(bank * 0.42 + (S.state === 'play' ? Math.sin(run.t * 2.3) * 0.015 : 0));
    ctx.scale(1 - Math.abs(bank) * 0.26, 1 - plane.pitch * 0.05);
  }
  if (useSheet) {
    ctx.imageSmoothingEnabled = false;   // pixel art nítido (el save/restore de afuera lo repone)
    // COLUMNA por alabeo. bank>0 = va a la DERECHA → tiene que banquear a la derecha, pero
    // los frames del modelo 3D giran en sentido opuesto al canvas, asi que se INVIERTE el
    // signo (esto corrige el "giraba para el lado contrario"). Nivelado = columna central.
    const col = rolling ? (SHEET_NF - 1) / 2 : Math.round((1 - bank) / 2 * (SHEET_NF - 1));
    // FILA por cabeceo. pitch>0 = trepa (morro arriba) → fila 0; nivel → 1; picada → 2
    const pc = Math.max(-1, Math.min(1, plane.pitch));
    const row = pc > 0.33 ? 0 : pc < -0.33 ? 2 : 1;
    const sx4 = col * SHEET_FW, sy4 = row * SHEET_FH;
    // fantasmas de la pirueta: 2 copias retrasadas en el giro, translucidas
    if (rolling) for (let gi = 2; gi >= 1; gi--) {
      ctx.save();
      ctx.rotate(-run.rollDir * gi * 0.55);
      ctx.globalAlpha = 0.14;
      ctx.drawImage(pl.sheetImg, sx4, sy4, SHEET_FW, SHEET_FH, -SHEET_FW / 2, -SHEET_FH / 2, SHEET_FW, SHEET_FH);
      ctx.restore();
    }
    if (run.boost) { const fl = 5 + Math.random() * 4; px(-2, SHEET_FH / 2 - 8, 4, fl, P.foam); px(-1, SHEET_FH / 2 - 8, 2, fl * 0.7, P.accent); }
    ctx.drawImage(pl.sheetImg, sx4, sy4, SHEET_FW, SHEET_FH, -SHEET_FW / 2, -SHEET_FH / 2, SHEET_FW, SHEET_FH);
    if (inp.fire && !run.overheat && run.fireT > 0.06) { px(-6, -2, 3, 2, P.ink); px(3, -2, 3, 2, P.ink); }
  } else if (pl.ready) {
    const PW = 54, PH = Math.round(PW * pl.h / pl.w);
    // fantasmas de la pirueta: 2 copias retrasadas en el giro, translucidas (estela cinematica)
    if (rolling) for (let gi = 2; gi >= 1; gi--) {
      ctx.save();
      ctx.rotate(-run.rollDir * gi * 0.55);
      ctx.globalAlpha = 0.14;
      ctx.drawImage(pl.img, -PW / 2, -PH / 2, PW, PH);
      ctx.restore();
    }
    // postquemador: fogonazo extra bajo la tobera solo con turbo (el sprite ya trae su glow)
    if (run.boost) { const fl = 5 + Math.random() * 4; px(-2, PH / 2 - 4, 4, fl, P.foam); px(-1, PH / 2 - 4, 2, fl * 0.7, P.accent); }
    ctx.drawImage(pl.img, -PW / 2, -PH / 2, PW, PH);
    // fogonazos del cañón
    if (inp.fire && !run.overheat && run.fireT > 0.06) { px(-6, -2, 3, 2, P.ink); px(3, -2, 3, 2, P.ink); }
  } else {
    // fallback: sprite de rects (por si la imagen no cargó)
    px(-2, -7, 4, 5, P.bodyDark); px(-1, -8, 2, 2, P.warn);
    px(-20, -1, 40, 3, P.body); px(-20, 0, 6, 2, P.bodyDark); px(14, 0, 6, 2, P.bodyDark);
    px(-3, -3, 6, 6, P.body); px(-2, -4, 4, 2, P.canopy); px(-12, 1, 3, 2, P.accent);
    const fl = run.boost ? 5 + Math.random() * 4 : (run.fuel > 0 ? 2 + Math.random() * 2 : 0);
    if (fl > 0) { px(-2, 3, 4, fl, run.boost ? P.foam : P.accent); px(-1, 3, 2, fl * 0.6, P.accent); }
    if (inp.fire && !run.overheat && run.fireT > 0.06) { px(-16, -2, 3, 2, P.ink); px(13, -2, 3, 2, P.ink); }
  }
  // mancha de sangre sobre el morro/cabina al atropellar (temporal; hacé un sprite ensangrentado si querés)
  if (run.bloodSplat > 0.02) {
    ctx.globalAlpha = Math.min(0.9, run.bloodSplat);
    px(-4, -2, 2, 1, '#7a1010'); px(-1, -3, 1, 1, '#9a1818'); px(2, -2, 2, 1, '#8a1414');
    px(-2, 1, 1, 1, '#7a1010'); px(4, -1, 1, 1, '#9a1818'); px(0, 0, 1, 1, '#8a1414'); px(-5, 0, 1, 1, '#6a0e0e');
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // mira: en el MOUSE (PC, punteria libre) o adelante del avion (tactil/legacy)
  if (S.state === 'play') {
    const vm = viewMouse();   // en camara CERCA la mira se dibuja en coords des-zoomeadas: queda bajo el cursor fisico
    const c = vm.on ? vm : proj(plane.x, plane.y, 70);
    ctx.globalAlpha = 0.7;
    px(c.x - 3, c.y, 2, 1, P.accent); px(c.x + 2, c.y, 2, 1, P.accent);
    px(c.x, c.y - 3, 1, 2, P.accent); px(c.x, c.y + 2, 1, 2, P.accent);
    if (vm.on) { ctx.strokeStyle = P.accent; ctx.globalAlpha = 0.35; ctx.strokeRect(c.x - 5, c.y - 5, 10, 10); }
    ctx.globalAlpha = 1;
  }
}
