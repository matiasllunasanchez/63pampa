// MENUS: seleccion de modo, seleccion de avion y el menu de configuracion de mapa [M].
//
// Igual que las demas pantallas: reciben `w`, un snapshot chico de solo lectura. No leen estado
// global ni lo modifican — la seleccion la maneja el input; aca solo se dibuja.
import { ctx, W, H, px, panel } from './ctx.js';
import { P } from '../data/palette.js';
import { PLANES } from '../data/planes.js';
import { T, getLang } from '../core/i18n.js';

export function drawMenu(w) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = 'bold 16px monospace';
  ctx.fillText(T('title'), W / 2, 20);
  ctx.fillStyle = P.dim; ctx.font = '6px monospace';
  ctx.fillText(T('selTitle'), W / 2, 32);
  // indicador de modo (menú compartido: ciclo de muerte o supervivencia)
  ctx.fillStyle = P.foam; ctx.font = 'bold 7px monospace';
  ctx.fillText(w.gameMode === 'cycle' ? T('modeCycle') : T('modeSurvival'), W / 2, 42);

  // preview del avión elegido, con leve cabeceo
  const pl = PLANES[w.selPlane];
  if (pl.ready) {
    const PW = 130, PH = Math.round(PW * pl.h / pl.w);
    ctx.drawImage(pl.img, Math.round(W / 2 - PW / 2), Math.round(76 - PH / 2 + Math.sin(w.t * 1.6) * 2), PW, PH);
  }
  // flechas de selección (parpadean)
  ctx.fillStyle = Math.sin(w.t * 6) > 0 ? P.ink : P.dim; ctx.font = 'bold 15px monospace';
  ctx.fillText('<', 16, 80); ctx.fillText('>', W - 16, 80);

  // nombre + descripción
  ctx.fillStyle = P.accent; ctx.font = 'bold 11px monospace';
  ctx.fillText(pl.name, W / 2, 114);
  ctx.fillStyle = P.dim; ctx.font = '6px monospace';
  ctx.fillText(pl.desc[getLang()] || pl.desc.es, W / 2, 126);

  // puntos indicadores del carrusel
  const n = PLANES.length, gap = 6, totW = (n - 1) * gap;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i === w.selPlane ? P.accent : '#3a464c';
    ctx.fillRect(Math.round(W / 2 - totW / 2 + i * gap) - 1, 134, 3, 3);
  }
  // prompt de arranque
  if (Math.sin(w.t * 4) > -0.3) {
    ctx.fillStyle = P.accent; ctx.font = 'bold 8px monospace';
    ctx.fillText(T('selHint'), W / 2, 150);
  }
  ctx.fillStyle = '#5c6e73'; ctx.font = '6px monospace';
  ctx.fillText('[L] ' + T('langName') + '   ·   [M] config mapa   ·   [ESC] modos', W / 2, 162);
  ctx.fillText(T('homage'), W / 2, 172);
}

// pantalla inicial: elegir CAMPAÑA / CICLO DE MUERTE / SUPERVIVENCIA (lista vertical)
export function drawModeSelect(w) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = 'bold 18px monospace';
  ctx.fillText(T('title'), W / 2, 28);
  ctx.fillStyle = P.dim; ctx.font = '7px monospace';
  ctx.fillText(T('modePrompt'), W / 2, 42);

  const opts = [
    { name: T('modeCampaign'), desc: T('modeCampaignDesc') },
    { name: T('modeCycle'), desc: T('modeCycleDesc') },
    { name: T('modeSurvival'), desc: T('modeSurvivalDesc') },
  ];
  const y0 = 60, rh = 34;
  for (let i = 0; i < opts.length; i++) {
    const y = y0 + i * rh, on = i === w.modeSel;
    ctx.strokeStyle = on ? P.accent : '#3a464c'; ctx.globalAlpha = on ? 1 : 0.55;
    ctx.strokeRect(28.5, y + 0.5, W - 57, rh - 8); ctx.globalAlpha = 1;
    if (on) {
      ctx.fillStyle = P.accent; ctx.globalAlpha = 0.09; ctx.fillRect(28, y, W - 57, rh - 8); ctx.globalAlpha = 1;
      ctx.fillStyle = P.accent; ctx.textAlign = 'left'; ctx.font = 'bold 9px monospace'; ctx.fillText('>', 34, y + 16);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = on ? P.accent : P.body; ctx.font = 'bold 10px monospace';
    ctx.fillText(opts[i].name, 46, y + 12);
    ctx.fillStyle = on ? P.ink : P.dim; ctx.font = '6px monospace';
    ctx.fillText(opts[i].desc, 46, y + 22);
  }

  ctx.textAlign = 'center';
  if (Math.sin(w.t * 4) > -0.3) {
    ctx.fillStyle = P.accent; ctx.font = 'bold 8px monospace';
    ctx.fillText(T('modeHint'), W / 2, 172);
  }
  ctx.fillStyle = '#5c6e73'; ctx.font = '6px monospace';
  ctx.fillText('[L] ' + T('langName'), W / 2, 160);
}

// menú de configuración de mapa [M] — herramienta para prototipar niveles
export function drawCfg(w) {
  ctx.fillStyle = '#0a0e11ee'; ctx.fillRect(24, 20, W - 48, H - 40);
  ctx.strokeStyle = P.accent; ctx.globalAlpha = 0.6; ctx.strokeRect(24.5, 20.5, W - 49, H - 41); ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = 'bold 8px monospace';
  ctx.fillText('CONFIGURACION DE MAPA', W / 2, 33);
  ctx.font = '7px monospace';
  const rows = w.rows;
  
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i], y = 48 + i * 13, on = i === w.cfgRow;
    let idx = r.opts.findIndex(o => o === r.get()); if (idx < 0) idx = 0;
    ctx.textAlign = 'left'; ctx.fillStyle = on ? P.accent : P.dim; ctx.fillText((on ? '> ' : '  ') + r.label, 34, y);
    ctx.textAlign = 'right'; ctx.fillStyle = on ? P.ink : P.body; ctx.fillText('< ' + r.names[idx] + ' >', W - 34, y);
  }
  ctx.textAlign = 'center'; ctx.fillStyle = P.dim; ctx.font = '6px monospace';
  ctx.fillText('flechas: mover / cambiar   ·   [M] o ENTER: cerrar', W / 2, H - 28);
}
