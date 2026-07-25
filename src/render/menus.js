// MENUS: seleccion de modo, seleccion de avion y el menu de configuracion de mapa [M].
//
// Igual que las demas pantallas: reciben `w`, un snapshot chico de solo lectura. No leen estado
// global ni lo modifican — la seleccion la maneja el input; aca solo se dibuja.
import { ctx, DW as W, DH as H, W as NW, H as NH, px, panel } from './ctx.js';
import { drawMira } from './miras.js';
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

// PORTADA y MENU DE MODOS: se dibujan en coordenadas NATIVAS (NW x NH = 480x270), no en la grilla
// de diseño como el resto de los menus. Motivo: son pantallas de puro texto sobre una ilustracion,
// y a resolucion nativa cada letra dispone de 1.5x mas pixeles → se ven mas NITIDAS y permiten
// cuerpos mas chicos sin empastarse. (En la grilla de diseño, ademas, los cuerpos impares caian en
// medio pixel al escalar por 1.5 y salian blandos.)

// GEOMETRIA de las filas del menu de modos, en coordenadas NATIVAS. Se EXPORTA porque el click
// tambien la necesita (game.js traduce el toque a fila): duplicarla a mano ya rompio el click.
export const MODE_ROWS = { y0: 88, rh: 30 };

export function drawTitle(w) {
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = 'bold 26px monospace';
  ctx.fillText(T('title'), NW / 2, 62);
  ctx.fillStyle = P.ink; ctx.globalAlpha = 0.75; ctx.font = '8px monospace';
  ctx.fillText(T('subtitle'), NW / 2, 78); ctx.globalAlpha = 1;
  if (Math.sin(w.t * 3.2) > -0.35) {                       // parpadeo lento: invita sin apurar
    ctx.fillStyle = P.accent; ctx.font = 'bold 11px monospace';
    ctx.fillText(T('pressStart'), NW / 2, NH - 34);
  }
  ctx.fillStyle = '#7d8f95'; ctx.font = '8px monospace';
  ctx.fillText('[L] ' + T('langName'), NW / 2, NH - 16);
}

export function drawModeSelect(w) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = 'bold 20px monospace';
  ctx.fillText(T('title'), NW / 2, 40);

  // opciones CHICAS, pegadas a la IZQUIERDA y centradas verticalmente. La ultima es SALIR.
  const opts = [
    { name: T('modeCampaign'), desc: T('modeCampaignDesc') },
    { name: T('modeCycle'), desc: T('modeCycleDesc') },
    { name: T('modeSurvival'), desc: T('modeSurvivalDesc') },
    { name: T('modeQuit'), desc: T('modeQuitDesc'), quit: true },
  ];
  const { y0, rh } = MODE_ROWS, x = 40, PAD_X = 9;   // x deja lugar al cursor '>' fuera del recuadro

  // el "ELEGI MODO DE JUEGO" encabeza la LISTA (no cuelga del titulo): asi se lee como el rotulo
  // de la seccion y no como un subtitulo suelto
  ctx.textAlign = 'left'; ctx.fillStyle = P.dim; ctx.font = '8px monospace';
  ctx.fillText(T('modePrompt'), x, y0 - 20);
  ctx.strokeStyle = '#3a464c'; ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(x, y0 - 15.5); ctx.lineTo(NW - 30, y0 - 15.5); ctx.stroke();
  ctx.globalAlpha = 1;

  for (let i = 0; i < opts.length; i++) {
    const y = y0 + i * rh, on = i === w.modeSel;
    const col = opts[i].quit ? (on ? P.warn : '#7d6a63') : (on ? P.accent : P.body);
    if (on) {
      // el resalte se AJUSTA al contenido (no cruza la pantalla): se mide el texto mas ancho de la
      // fila y se le suma padding, para que no quede al ras de las letras.
      ctx.font = 'bold 10px monospace'; const wn = ctx.measureText(opts[i].name).width;
      ctx.font = '7px monospace'; const wd = ctx.measureText(opts[i].desc).width;
      const boxW = Math.max(wn, wd) + PAD_X * 2;
      ctx.fillStyle = col; ctx.globalAlpha = 0.13;
      ctx.fillRect(x - PAD_X, y - 13, boxW, 28); ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.globalAlpha = 0.5;                 // filo izquierdo: ancla la fila
      ctx.fillRect(x - PAD_X, y - 13, 2, 28); ctx.globalAlpha = 1;
      ctx.textAlign = 'left'; ctx.fillStyle = col; ctx.font = 'bold 10px monospace';
      ctx.fillText('>', x - PAD_X - 9, y);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = col; ctx.font = 'bold 10px monospace';
    ctx.fillText(opts[i].name, x, y);
    ctx.fillStyle = on ? P.ink : P.dim; ctx.globalAlpha = on ? 0.9 : 0.6; ctx.font = '7px monospace';
    ctx.fillText(opts[i].desc, x, y + 10); ctx.globalAlpha = 1;
  }

  ctx.textAlign = 'center';
  if (Math.sin(w.t * 4) > -0.3) {
    ctx.fillStyle = P.accent; ctx.font = 'bold 9px monospace';
    ctx.fillText(T('modeHint'), NW / 2, NH - 30);
  }
  ctx.fillStyle = '#5c6e73'; ctx.font = '8px monospace';
  ctx.fillText('[L] ' + T('langName'), NW / 2, NH - 14);
}

// menú de configuración de mapa [M] — herramienta para prototipar niveles
export function drawCfg(w) {
  // el panel se estiro y las filas se juntaron (13 -> 12 px) al sumar MIRA: con 10 filas el
  // layout viejo se comia el pie de ayuda
  ctx.fillStyle = '#0a0e11ee'; ctx.fillRect(24, 16, W - 48, H - 30);
  ctx.strokeStyle = P.accent; ctx.globalAlpha = 0.6; ctx.strokeRect(24.5, 16.5, W - 49, H - 31); ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = 'bold 8px monospace';
  ctx.fillText('CONFIGURACION DE MAPA', W / 2, 28);
  ctx.font = '7px monospace';
  const rows = w.rows;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i], y = 42 + i * 12, on = i === w.cfgRow;
    let idx = r.opts.findIndex(o => o === r.get()); if (idx < 0) idx = 0;
    ctx.textAlign = 'left'; ctx.fillStyle = on ? P.accent : P.dim; ctx.fillText((on ? '> ' : '  ') + r.label, 34, y);
    ctx.textAlign = 'right'; ctx.fillStyle = on ? P.ink : P.body; ctx.fillText('< ' + r.names[idx] + ' >', W - 34, y);
    // VISTA PREVIA: la mira se elige VIENDOLA, no leyendo un numero
    if (r.preview === 'mira') drawMira(r.get(), W - 68, y - 2.5, 11, on ? 1 : 0.55);
  }
  ctx.textAlign = 'center'; ctx.fillStyle = P.dim; ctx.font = '6px monospace';
  ctx.fillText('flechas: mover / cambiar   ·   [M] o ENTER: cerrar', W / 2, H - 20);
}
