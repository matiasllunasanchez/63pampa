// MENUS: seleccion de modo, seleccion de avion y el menu de configuracion de mapa [M].
//
// Igual que las demas pantallas: reciben `w`, un snapshot chico de solo lectura. No leen estado
// global ni lo modifican — la seleccion la maneja el input; aca solo se dibuja.
import { ctx, DW as W, DH as H, W as NW, H as NH, px, panel, titleFont, menuFont, descFont, labelFont, uiFont, FONT_OTHERS } from './ctx.js';
import { drawMira } from './miras.js';
import { P } from '../data/palette.js';
import { PLANES } from '../data/planes.js';
import { T, getLang } from '../core/i18n.js';

// ELECCION DE AVION — la pantalla previa de CICLO DE MUERTE y POR LA PATRIA. Usa los MISMOS
// roles tipograficos que el lobby (logotipo / rotulo / nombre / texto corrido), para que las dos
// pantallas se lean como el mismo juego y no como dos menus distintos.
// OJO CON LOS CUERPOS: esta pantalla se dibuja en la grilla de DISEÑO (320x180) y el menu de
// modos en coordenadas NATIVAS (480x270). Un mismo numero de px NO se ve igual en las dos: aca
// hay que dividir por U (1.5). Por eso el logotipo va en 18 y alla en 26.
export function drawMenu(w) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(18);              // logotipo: Kirana
  ctx.fillText(T('title'), W / 2, 20);
  // EL MODO manda: va pegado al logotipo y en grande, porque es DONDE ESTAS. El rotulo de la
  // pantalla ("elegi tu avion") es la instruccion, y va despues de un respiro.
  ctx.fillStyle = P.foam; ctx.font = menuFont(13);
  ctx.fillText(w.gameMode === 'cycle' ? T('modeCycle')
    : w.gameMode === 'arena' ? T('modeArena') : T('modeSurvival'), W / 2, 35);
  ctx.fillStyle = P.dim; ctx.font = labelFont(9);                  // rotulo de seccion: GlimpRThin
  ctx.fillText(T('selTitle'), W / 2, 50);

  // preview del avión elegido, con leve cabeceo
  const pl = PLANES[w.selPlane];
  if (pl.ready) {
    const PW = 130, PH = Math.round(PW * pl.h / pl.w);
    ctx.drawImage(pl.img, Math.round(W / 2 - PW / 2), Math.round(80 - PH / 2 + Math.sin(w.t * 1.6) * 2), PW, PH);
  }
  // flechas de selección (parpadean)
  ctx.fillStyle = Math.sin(w.t * 6) > 0 ? P.ink : P.dim; ctx.font = 'bold 15px monospace';
  ctx.fillText('<', 16, 84); ctx.fillText('>', W - 16, 84);

  // nombre + descripción: mismo par que en el menu de modos — nombre en la condensada,
  // descripcion en la manuscrita (ver docs/REFERENCIAS.md: son las cartas de los soldados)
  ctx.fillStyle = P.accent; ctx.font = menuFont(12);
  ctx.fillText(pl.name, W / 2, 114);
  ctx.fillStyle = P.dim; ctx.font = descFont(10);
  ctx.fillText(pl.desc[getLang()] || pl.desc.es, W / 2, 127);

  // puntos indicadores del carrusel
  const n = PLANES.length, gap = 6, totW = (n - 1) * gap;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i === w.selPlane ? P.accent : '#3a464c';
    ctx.fillRect(Math.round(W / 2 - totW / 2 + i * gap) - 1, 134, 3, 3);
  }
  // PIE: una sola linea de teclas, en la misma fuente que el rotulo "ELEGI TU AVION" (GlimpRThin)
  // para que se lean como parte del mismo sistema. Salieron de aca el prompt amarillo que
  // parpadeaba (lo dice la fila [ENTER]), el idioma (vive en OPCIONES) y el homenaje (subio a la
  // portada, que es donde se lee de verdad).
  ctx.fillStyle = '#7d8f95'; ctx.font = labelFont(4.5);   // mitad de cuerpo: es ayuda, no contenido
  ctx.fillText(T('selKeys'), W / 2, 166);
}

// PORTADA y MENU DE MODOS: se dibujan en coordenadas NATIVAS (NW x NH = 480x270), no en la grilla
// de diseño como el resto de los menus. Motivo: son pantallas de puro texto sobre una ilustracion,
// y a resolucion nativa cada letra dispone de 1.5x mas pixeles → se ven mas NITIDAS y permiten
// cuerpos mas chicos sin empastarse. (En la grilla de diseño, ademas, los cuerpos impares caian en
// medio pixel al escalar por 1.5 y salian blandos.)

// GEOMETRIA de las filas del menu de modos, en coordenadas NATIVAS. Se EXPORTA porque el click
// tambien la necesita (game.js traduce el toque a fila): duplicarla a mano ya rompio el click.
// rh subio de 30 a 36 al agrandar la descripcion: con la fuente proporcional, sus ascendentes
// trepaban hasta la linea de base del NOMBRE de arriba y las dos lineas se tocaban.
// Cada fila ocupa ~33 px (nombre en `y`, descripcion en y+14, resalte de y-13 a y+20). Con la
// entrada de ARENA son SEIS, y con el paso viejo (y0 86, rh 36) la ultima caia en y=266: la
// descripcion se salia de los 270 de alto. El toque tactil lee estos mismos numeros, asi que
// ajustarlos aca reubica tambien las zonas tocables.
export const MODE_ROWS = { y0: 78, rh: 31 };

export function drawTitle(w) {
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(34);   // logotipo: Kirana
  ctx.fillText(T('title'), NW / 2, 62);
  ctx.fillStyle = P.ink; ctx.globalAlpha = 0.75; ctx.font = '8px monospace';
  ctx.fillText(T('subtitle'), NW / 2, 78); ctx.globalAlpha = 1;
  // HOMENAJE: es lo ultimo que se lee antes de empezar, y va en la manuscrita — es la razon de
  // ser del juego, no un pie de pagina (ver docs/REFERENCIAS.md). Antes vivia perdido abajo de
  // la pantalla de eleccion de avion.
  ctx.fillStyle = P.ink; ctx.globalAlpha = 0.8; ctx.font = descFont(15);
  ctx.fillText(T('homage'), NW / 2, NH - 42); ctx.globalAlpha = 1;
  if (Math.sin(w.t * 3.2) > -0.35) {                       // parpadeo lento: invita sin apurar
    ctx.fillStyle = P.accent; ctx.font = labelFont(11);    // mas chico: no le gana al homenaje
    ctx.fillText(T('pressStart'), NW / 2, NH - 22);
  }
  // el idioma dejo de estar aca: ahora vive en OPCIONES, dentro del menu de modos
}

// Cuerpo del texto corrido del menu. Las proporcionales tienen la x mas baja que el monospace,
// asi que necesitan mas cuerpo que los 7px de antes para verse del MISMO tamaño — no es que el
// texto sea "mas grande". Si se cambia la familia (FONTS.desc en ctx.js), reajustar aca.
const DESC_PX = 15;

// BANCO DE PRUEBAS: cada renglon del menu sale con una familia distinta y su nombre al costado,
// para compararlas en el tamaño y sobre el fondo reales. DESC_TRY = null vuelve todas a la fuente
// fija (FONTS.desc en ctx.js). Los cuerpos van por familia: comparar todas al mismo "px" engaña,
// porque la altura de la x cambia mucho de una a otra.
const DESC_TRY = null;   // FONT_OTHERS para volver a comparar una familia por renglon
const TRY_PX = { EmbolismSpark: 15, GlimpRThin: 14, GlimpRThinItalic: 14, SmoothElegant: 16 };
const rowFamily = i => DESC_TRY ? DESC_TRY[i % DESC_TRY.length] : null;
/** Fuente de la descripcion `i`. Se usa para MEDIR y para DIBUJAR — el resalte de la fila se
 *  ajusta al contenido, asi que si los dos lados no usan la misma, el recuadro deja de calzar. */
const rowFont = i => {
  const f = rowFamily(i);
  return f ? uiFont(f, TRY_PX[f] || 15, '') : descFont(DESC_PX);
};

export function drawModeSelect(w) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(26);   // mismo logotipo que la portada
  ctx.fillText(T('title'), NW / 2, 40);

  // opciones CHICAS, pegadas a la IZQUIERDA y centradas verticalmente. La ultima es SALIR.
  // el orden tiene que coincidir con MODES en game.js: la fila que se toca sale de ese indice
  const opts = [
    { name: T('modeCampaign'), desc: T('modeCampaignDesc') },
    { name: T('modeCycle'), desc: T('modeCycleDesc') },
    { name: T('modeSurvival'), desc: T('modeSurvivalDesc') },
    { name: T('modeArena'), desc: T('modeArenaDesc') },
    { name: T('modeOptions'), desc: T('modeOptionsDesc') },
    { name: T('modeQuit'), desc: T('modeQuitDesc'), quit: true },
  ];
  const { y0, rh } = MODE_ROWS, x = 40, PAD_X = 9;   // x deja lugar al cursor '>' fuera del recuadro

  // el "ELEGI MODO DE JUEGO" encabeza la LISTA (no cuelga del titulo): asi se lee como el rotulo
  // de la seccion y no como un subtitulo suelto
  ctx.textAlign = 'left'; ctx.fillStyle = P.dim; ctx.font = labelFont(13);   // GlimpRThin
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
      ctx.font = menuFont(12); const wn = ctx.measureText(opts[i].name).width;
      ctx.font = rowFont(i); const wd = ctx.measureText(opts[i].desc).width;
      const boxW = Math.max(wn, wd) + PAD_X * 2;
      ctx.fillStyle = col; ctx.globalAlpha = 0.13;
      ctx.fillRect(x - PAD_X, y - 13, boxW, 33); ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.globalAlpha = 0.5;                 // filo izquierdo: ancla la fila
      ctx.fillRect(x - PAD_X, y - 13, 2, 33); ctx.globalAlpha = 1;
      ctx.textAlign = 'left'; ctx.fillStyle = col; ctx.font = 'bold 10px monospace';
      ctx.fillText('>', x - PAD_X - 9, y);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = col; ctx.font = menuFont(12);   // OtflagSans (la misma con la que se midio)
    ctx.fillText(opts[i].name, x, y);
    ctx.fillStyle = on ? P.ink : P.dim; ctx.globalAlpha = on ? 0.9 : 0.6;
    ctx.font = rowFont(i);                     // la MISMA con la que se midio el resalte arriba
    ctx.fillText(opts[i].desc, x, y + 14);
    if (DESC_TRY) {                            // rotulo de la familia, para saber cual es cual
      const wd2 = ctx.measureText(opts[i].desc).width;
      ctx.globalAlpha = 0.45; ctx.fillStyle = P.accent; ctx.font = '6px monospace';
      ctx.fillText('· ' + rowFamily(i), x + wd2 + 5, y + 14);
    }
    ctx.globalAlpha = 1;
  }

  // sin pie: el "flechas / ENTER" y el cambio de idioma salieron de aca. Lo primero porque la
  // lista ya se explica sola (hay un cursor > sobre la fila); lo segundo porque el idioma es
  // ahora una fila mas del menu (OPCIONES).
}

// OPCIONES — se llega desde el menu de modos. LISTA de preferencias del jugador: las filas (que
// son, que valor muestran y que hace cambiarlas) viven en OPT_ROWS, en game.js; aca solo se
// dibuja lo que llega en `w.rows` = [{label, value}] con `w.sel` marcando la activa.
const OPT_ROWS_GEO = { y0: 122, rh: 40 };
export function drawOptions(w) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(26);
  ctx.fillText(T('title'), NW / 2, 40);

  const x = 40;
  ctx.textAlign = 'left'; ctx.fillStyle = P.dim; ctx.font = labelFont(13);
  ctx.fillText(T('optTitle'), x, 86);
  ctx.strokeStyle = '#3a464c'; ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(x, 91.5); ctx.lineTo(NW - 30, 91.5); ctx.stroke();
  ctx.globalAlpha = 1;

  // FILAS: nombre arriba, valor abajo entre flechas (que es como se cambia). El recuadro se mide
  // igual que en el menu de modos — se ajusta al contenido, no cruza la pantalla. Las FLECHAS van
  // solo en la fila activa: son la accion disponible, no un adorno de cada renglon.
  const { y0, rh } = OPT_ROWS_GEO, PAD_X = 9, AR = 14;   // AR: hueco que ocupa cada flecha
  for (let i = 0; i < w.rows.length; i++) {
    const r = w.rows[i], y = y0 + i * rh, on = i === w.sel, col = on ? P.accent : P.body;
    ctx.font = menuFont(12); const wn = ctx.measureText(r.label).width;
    ctx.font = descFont(DESC_PX); const wl = ctx.measureText(r.value).width;
    if (on) {
      const boxW = Math.max(wn, wl + AR * 2) + PAD_X * 2;
      ctx.fillStyle = col; ctx.globalAlpha = 0.13;
      ctx.fillRect(x - PAD_X, y - 13, boxW, 33); ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.globalAlpha = 0.5;              // filo izquierdo: ancla la fila
      ctx.fillRect(x - PAD_X, y - 13, 2, 33); ctx.globalAlpha = 1;
    }
    ctx.fillStyle = col; ctx.font = menuFont(12);
    ctx.fillText(r.label, x, y);
    ctx.fillStyle = on ? P.ink : P.dim; ctx.globalAlpha = on ? 1 : 0.6;
    ctx.font = descFont(DESC_PX); ctx.fillText(r.value, x + AR, y + 14);
    ctx.globalAlpha = 1;
    if (on) {
      ctx.fillStyle = Math.sin(w.t * 6) > 0 ? P.ink : P.dim;   // parpadean: son la accion
      ctx.font = menuFont(10);
      ctx.fillText('<', x, y + 14);
      ctx.fillText('>', x + AR + wl + 6, y + 14);
    }
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#7d8f95'; ctx.font = labelFont(6);    // mitad de cuerpo: es ayuda, no contenido
  ctx.fillText(T('optKeys'), NW / 2, NH - 22);
}

// menú de configuración de mapa [M] — herramienta para prototipar niveles.
// VISIBLES: cuantas filas entran en el panel. La lista ya no cabe entera (terreno, pista,
// acantilado, arranque, hitboxes...), asi que el panel SCROLLEA: se muestra una ventana de
// CFG_VIEW filas que sigue al cursor y se marca con una barra lateral. El resto del layout
// (12 px por fila) no cambia.
const CFG_VIEW = 9;

/** Primera fila visible para que `cfgRow` quede dentro de la ventana. La ventana solo se mueve
 *  cuando el cursor la toca — asi la lista no se desliza bajo el dedo en cada tecla. */
export function cfgScroll(cfgRow, n) {
  if (n <= CFG_VIEW) return 0;
  return Math.max(0, Math.min(n - CFG_VIEW, cfgRow - Math.floor(CFG_VIEW / 2)));
}

export function drawCfg(w) {
  ctx.fillStyle = '#0a0e11ee'; ctx.fillRect(24, 16, W - 48, H - 30);
  ctx.strokeStyle = P.accent; ctx.globalAlpha = 0.6; ctx.strokeRect(24.5, 16.5, W - 49, H - 31); ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = 'bold 8px monospace';
  ctx.fillText('CONFIGURACION DE MAPA', W / 2, 28);
  ctx.font = '7px monospace';
  const rows = w.rows, n = rows.length;
  const top = cfgScroll(w.cfgRow, n), vis = Math.min(CFG_VIEW, n);

  for (let v = 0; v < vis; v++) {
    const i = top + v, r = rows[i], y = 42 + v * 12, on = i === w.cfgRow;
    let idx = r.opts.findIndex(o => o === r.get()); if (idx < 0) idx = 0;
    ctx.textAlign = 'left'; ctx.fillStyle = on ? P.accent : P.dim; ctx.fillText((on ? '> ' : '  ') + r.label, 34, y);
    ctx.textAlign = 'right'; ctx.fillStyle = on ? P.ink : P.body; ctx.fillText('< ' + r.names[idx] + ' >', W - 34, y);
    // VISTA PREVIA: la mira se elige VIENDOLA, no leyendo un numero
    if (r.preview === 'mira') drawMira(r.get(), W - 68, y - 2.5, 11, on ? 1 : 0.55);
  }

  // BARRA DE SCROLL: solo si hay mas filas de las que entran. El pulgar se dimensiona por la
  // fraccion visible, asi de un vistazo se sabe cuanto falta.
  if (n > CFG_VIEW) {
    const bx = W - 28, by = 36, bh = CFG_VIEW * 12;
    px(bx, by, 2, bh, '#2e3c45');
    const th = Math.max(6, Math.round(bh * CFG_VIEW / n));
    px(bx, by + Math.round((bh - th) * (top / (n - CFG_VIEW))), 2, th, P.accent);
    ctx.textAlign = 'center'; ctx.fillStyle = P.dim; ctx.font = '6px monospace';
    if (top > 0) ctx.fillText('▲', bx + 1, by - 2);                       // hay mas arriba
    if (top + CFG_VIEW < n) ctx.fillText('▼', bx + 1, by + bh + 7);       // hay mas abajo
  }

  ctx.textAlign = 'center'; ctx.fillStyle = P.dim; ctx.font = '6px monospace';
  ctx.fillText('flechas: mover / cambiar   ·   [M] o ENTER: cerrar', W / 2, H - 20);
}
